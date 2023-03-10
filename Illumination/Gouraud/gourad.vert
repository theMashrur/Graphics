#version 300 es

// Vertex position in object space coordinates
in vec3 vertexPosition;
// Surface normal at the vertex in object space coordinates
in vec3 vertexNormal;
// Texture coordinates at that vertex
in vec2 vertexTextureCoordinates;

// Model matrix
uniform mat4 mMatrix;
// View matrix
uniform mat4 vMatrix;
// Projection matrix
uniform mat4 pMatrix;

uniform float lightIntensity;
uniform bool lightInCamspace;
uniform vec4 lightPosition;
uniform vec4 ambient;
uniform vec4 specular;
uniform vec4 diffuse;
uniform float shininess;

// Output color to be interpolated for each fragment
out vec4 color;

// Main program for each vertex
void main() {
vec4 vertexCamSpace = vMatrix * mMatrix * vec4(vertexPosition, 1.0);
gl_Position = pMatrix * vertexCamSpace;
vec3 normalCamSpace = (vMatrix * mMatrix * vec4(vertexNormal, 0.0)).xyz;
vec3 normal = normalize(normalCamSpace);
// Compute lighting for each vertex
vec3 lightDirection;
if (lightInCamspace) {
lightDirection = (lightPosition - vertexCamSpace).xyz;
} else {
vec4 lightCamSpace = vMatrix * lightPosition;
lightDirection = (lightCamSpace - vertexCamSpace).xyz;
}

float d = length(lightDirection);
// Inverse Square Law
float lightInt = lightIntensity/(4.0 * 3.14 * d);
lightDirection = normalize(lightDirection);

// Diffuse Term, making sure non-negative
vec3 diffuseReflection = diffuse.xyz * lightIntensity * max(dot(lightDirection, normal), 0.0);

vec3 viewDirection = normalize(-vertexCamSpace.xyz);
vec3 halfwayDirection = normalize(lightDirection + viewDirection);
// Specular Term, making sure, non-negative
float specularReflection = pow(max(dot(normal, halfwayDirection), 0.0), shininess);
vec3 specularColor = specular.xyz * lightIntensity * specularReflection;

color = vec4(diffuseReflection + specularColor, 1.0) + ambient;
}