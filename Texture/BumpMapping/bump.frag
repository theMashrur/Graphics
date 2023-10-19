#version 300 es

// For better performance, use lower precision
precision highp float;

// Per-vertex normal, from vertex shader
in vec3 vNormal;
// Per-vertex position, from vertex shader
in vec3 vPosition;
// Per-vertex Texture coordinates, from vertex shader
in vec2 vTextureCoordinates;

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

// Texture sampler
uniform sampler2D sampler;
// Normal map sampler
uniform sampler2D normalMap;

// Per-Vertex Camera Space, from vertex shader
in vec4 vertexCamSpace;

out vec4 fragColor;

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
  float lightInt  = lightIntensity/(4.0 * 3.14 * d * d);
  lightDirection = normalize(lightDirection);
  vec3 normal = normalize(vNormal);

  // Calculate bitangent vector, assuming no sharp edges
  vec3 bitangent = cross(normal, vec3(0, 0, 1));
  if (length(bitangent) < 0.1) { // Check if perpendicular or not to z axis, up to tolerance
    bitangent = cross(normal, vec3(0, 1, 0)); // Recalculate bitangent accordingly
  }
  // Calculate tangent vector from bitangent
  vec3 tangent = normalize(cross(bitangent, normal));

  // Get the texture colour
  vec4 texColor = texture(sampler, vTextureCoordinates);
  // Get the normal map
  vec3 normalMapColor = texture(normalMap, vTextureCoordinates).xyz;
  // Convert the normal map to a tangent space normal
  vec3 tangentNormal = normalize(normalMapColor * 2.0 - 1.0); // Convert range to [-1, 1]
  // Convert to world space
  vec3 worldNormal = normalize(mat3(tangent, bitangent, normal) * tangentNormal);

  // Use calculated normals
  vec3 reflectDirection = reflect(-lightDirection, worldNormal);
  vec3 viewDirection = normalize(-vPosition);
  
  // Diffuse term of phong, making sure non-negative, using calculated normals
  float diffuseTerm = max(dot(lightDirection, worldNormal), 0.0);
  // Specular term of phong, making sure non-negative, using calculated normals
  float specularTerm = pow(max(dot(reflectDirection, viewDirection), 0.0), shininess);

  // Calculate colour of fragment
  fragColor = lightIntensity * (ambientColor + diffuseTerm * diffuseColor + specularTerm * specularColor) * texColor;
}