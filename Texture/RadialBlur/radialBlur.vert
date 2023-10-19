#version 300 es

// Vertex coordinates in object space for the render quad
in vec3 vertexPosition;
// Texture coordinate for this vertex and the render quad
in vec2 vertexTextureCoordinates;

// Texture coordinate needs to be passed on to the R2T fragment shader
out vec2 fragmentTextureCoordinates;

// Main program for each vertex of the render quad
void main() {
  gl_Position = vec4(vertexPosition, 1.0);
  fragmentTextureCoordinates = vertexTextureCoordinates;
}