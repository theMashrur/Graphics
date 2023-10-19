#version 300 es

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

uniform vec4 lightPosition;
uniform bool lightInCamspace;

out vec3 normal;
out vec3 lightDirection;

void main() {
  vec4 vertexCamSpace = vMatrix * mMatrix * vec4(vertexPosition, 1.0);
  gl_Position = pMatrix * vertexCamSpace;

  normal = normalize(mat3(mMatrix) * vertexNormal);
  
  if (lightInCamspace) {
    lightDirection = normalize(vec3(lightPosition - vertexCamSpace));
  } else {
    lightDirection = normalize(vec3(lightPosition));
  }
}