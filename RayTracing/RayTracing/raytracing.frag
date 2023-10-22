#version 300 es

precision highp float;

// A texture sampling unit, which is bound to the render quad texture buffer
uniform sampler2D textureRendered;

uniform vec3 backgroundColor;
uniform vec4 lightPosition;
uniform float lightIntensity;
uniform bool lightInCamspace;

uniform float canvasWidth;
uniform float canvasHeight;

uniform vec3 cameraPosition;
uniform mat3 cameraRotation;

uniform bool isOrthographicProjection;

uniform float orthographicFOV;
uniform float perspectiveFOV;

// Texture coordinates coming from the vertex shader, interpolated through the rasterizer
in vec2 fragmentTextureCoordinates;
in vec3 origin;
in vec3 dir;

out vec4 fragColor;

struct Sphere
{
	vec3 centre;
	float radius;
	vec3 colour;
};

struct Plane
{
	vec3 point;
	vec3 normal;
	vec3 colour;
};

const int max_depth = 3;
const float shadowRayBias = 0.0000001;
const float shininess = 10.0;

struct Ray
{
    vec3 origin;
    vec3 dir;
};

bool intersectSphere(Ray ray, Sphere sphere, out vec3 intersectionPoint, out vec3 normal)
{
    vec3 oc = ray.origin - sphere.centre;
    float b = dot(oc, ray.dir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - c;
    if (discriminant > 0.001)
    {
        float t = -b - sqrt(discriminant);
        if (t > 0.0001)
        {
            intersectionPoint = ray.origin + ray.dir * t;
            normal = normalize(intersectionPoint - sphere.centre);
            return true;
        }
    }
    return false;
}

// Function for intersetion with floor plane
bool intersectPlane(Ray ray, Plane plane, out vec3 intersectionPoint, out vec3 normal)
{
    float denom = dot(ray.dir, plane.normal);
    if (abs(denom) > 0.0001)
    {
        vec3 p0l0 = plane.point - ray.origin;
        float t = dot(p0l0, plane.normal) / denom;
        if (t >= 0.001)
        {
            intersectionPoint = ray.origin + ray.dir * t;
            normal = plane.normal;
            return true;
        }
    }
    intersectionPoint = vec3(1000000, 1000000, 1000000);
    normal = vec3(0, 0, 0);
    return false;
}


float checkers(in vec2 p){
    vec2 q = floor(p);
    return mod(q.x + q.y, 2.0);
}

void main(){
    fragColor = texture(textureRendered, fragmentTextureCoordinates.st);
    int num_spheres = 6;
    int num_planes = 1;
    Plane plane;

    // Define scene spheres
    Sphere spheres[6];
    spheres[0].centre = vec3(-2.0, 1.5, -3.5);
    spheres[0].radius = 1.5;
    spheres[0].colour = vec3(0.8,0.8,0.8);
    spheres[1].centre = vec3(-0.5, 0.0, -2.0);
    spheres[1].radius = 0.6;
    spheres[1].colour = vec3(0.3,0.8,0.3);
    spheres[2].centre = vec3(1.0, 0.7, -2.2);
    spheres[2].radius = 0.8;
    spheres[2].colour = vec3(0.3,0.8,0.8);
    spheres[3].centre = vec3(0.7, -0.3, -1.2);
    spheres[3].radius = 0.2;
    spheres[3].colour = vec3(0.8,0.8,0.3);
    spheres[4].centre = vec3(-0.7, -0.3, -1.2);
    spheres[4].radius = 0.2;
    spheres[4].colour = vec3(0.8,0.3,0.3);
    spheres[5].centre = vec3(0.2, -0.2, -1.2);
    spheres[5].radius = 0.3;
    spheres[5].colour = vec3(0.8,0.3,0.8);

    // Create floor plane
    plane.point = vec3(0.0, -0.5, 0.0);
    plane.normal = vec3(0.0, 1.0, 0.0);
    plane.colour = vec3(0.8, 0.8, 0.8);

    // Create ray
    Ray ray;
    ray.origin = origin;
    ray.dir = normalize(dir);
    float reflect_factor = 1.0;

    // Start ray tracing up to max_depth
    for (int i=0; i<max_depth; i++){
        // Find closest intersection
        float closestDistance = 1000000.0;
        vec3 closestPoint;
        vec3 closestNormal;
        bool hit = false;
        int closestObject = -1;

        // Check for intersection with spheres
        for (int j=0; j<num_spheres; j++){
            vec3 intersectionPoint;
            vec3 normal;
            if (intersectSphere(ray, spheres[j], intersectionPoint, normal)){
                float distance = length(intersectionPoint - ray.origin);
                if (distance < closestDistance){
                    closestDistance = distance;
                    closestPoint = intersectionPoint;
                    closestNormal = normal;
                    closestNormal = normalize(closestNormal);
                    hit = true;
                    closestObject = j;
                }
            }
        }

        // Check for intersection with planes
        vec3 intersectionPoint;
        vec3 normal;
        if (intersectPlane(ray, plane, intersectionPoint, normal)){
            float distance = length(intersectionPoint - ray.origin);
            if (distance < closestDistance){
                closestDistance = distance;
                closestPoint = intersectionPoint;
                closestNormal = normal;
                closestNormal = normalize(closestNormal);
                hit = true;
                closestObject = -1;
            }
        }

        // If no intersection, accumulate background colour then exit
        if (!hit){
            fragColor = vec4(fragColor.rgb + reflect_factor * backgroundColor, 1.0);
            return;
        } else{ // Else calculate colour on ray hit
            vec3 colour;
            vec3 lightDir = normalize(lightPosition.xyz - closestPoint);
            vec3 viewDir = normalize(cameraPosition - closestPoint);
            vec3 reflectDir = normalize(reflect(-lightDir, closestNormal));
            float specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            float diffuse = max(dot(closestNormal, lightDir), 0.0);
            if(closestObject >= 0){
                vec3 col = spheres[closestObject].colour;
                colour = spheres[closestObject].colour * (diffuse + specular) * lightIntensity;
            } else {
                float checkers = checkers(closestPoint.xz);
                vec3 checkers_colour = checkers > 0.0 ? plane.colour : vec3(0.0, 0.0, 0.0);
                colour = checkers_colour * (diffuse + specular) * lightIntensity;
            }

            // Shadow ray
            Ray shadowRay;
            shadowRay.origin = closestPoint + shadowRayBias * closestNormal;
            shadowRay.dir = lightDir;
            bool shadow = false;
            for (int j=0; j<num_spheres; j++){
                vec3 intersectionPoint;
                vec3 normal;
                if (intersectSphere(shadowRay, spheres[j], intersectionPoint, normal)){
                    shadow = true;
                }
            }
            if (shadow) {
                fragColor = vec4(colour * 0.5, 1.0);
                break;
            }
            // Cast secondary, reflected ray
            ray.origin = closestPoint + shadowRayBias * closestNormal;
            ray.dir = reflect(ray.dir, closestNormal);
            ray.dir = normalize(ray.dir);
            fragColor = vec4(fragColor.rgb + reflect_factor * colour, 1.0);
            // Geometrically decrement reflect factor: successive reflections should fade
            reflect_factor = 0.3 * reflect_factor;
        }
    }

}

