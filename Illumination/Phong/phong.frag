#version 300 es

// For better performance less precision
precision highp float;

// Per-vertex normal, from vertex shader
in vec3 vNormal;
// Per-vertex position, from vertex shader
in vec3 vPosition;

// Ambient color
uniform vec4 ambientColor;
// Diffuse color
uniform vec4 diffuseColor;
// Specular color
uniform vec4 specularColor;
// Shininess
uniform float shininess;
// Light position
uniform vec4 lightPosition;
// Light intensity
uniform float lightIntensity;
// Boolean indicating if the light is in camera space
uniform bool lightInCamspace;

// Per-Vertex Camera Space, from vertex shader
in vec4 vertexCamSpace;

out vec4 fragColor;

// Main program for each fragment = pixel candidate
void main() {
  vec3 lightDirection;
  if (!lightInCamspace) {
    lightDirection = (lightPosition - vertexCamSpace).xyz;
  } else {
    vec3 vVertexPos = vec3(lightPosition * vec4(vPosition, 1.0));
    lightDirection = vVertexPos - vPosition;
  }
  float d = length(lightDirection);
  // Inverse Square Law
  float lightInt = lightIntensity/(4.0 * 3.14 * d);
  lightDirection = normalize(lightDirection);
  vec3 normal = normalize(vNormal);
  vec3 reflectDirection = reflect(-lightDirection, normal);
  vec3 viewDirection = normalize(-vPosition);
  
  // Diffuse term of phong, making sure non-negative
  float diffuseTerm = max(dot(lightDirection, normal), 0.0);
  // Specular term of phong, making sure non-negative
  float specularTerm = pow(max(dot(reflectDirection, viewDirection), 0.0), shininess);
  
  fragColor = lightIntensity * (ambientColor + diffuseTerm * diffuseColor + specularTerm * specularColor);
}
