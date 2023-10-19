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

// Output position in view space
out vec3 vPosition;
// Output normal in view space
out vec3 vNormal;
// Output texture coordinates
out vec2 vTextureCoordinates;

out vec4 vertexCamSpace;

// Main program for each vertex
void main() {
  vec4 vertexCamSpace = vMatrix * mMatrix * vec4(vertexPosition, 1.0);
  gl_Position = pMatrix * vertexCamSpace;
  
  vPosition = vertexCamSpace.xyz;
  
  // Vertex normal in camera space
  vNormal = (vMatrix * mMatrix * vec4(vertexNormal, 0.0)).xyz;
  
  // Pass through texture coordinates
  vTextureCoordinates = vertexTextureCoordinates;
}