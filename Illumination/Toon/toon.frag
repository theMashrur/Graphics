#version 300 es

precision highp float;
in vec3 normal;
in vec3 lightDirection;

out vec4 fragColor;

void main() {
  float intensity = dot(normal, lightDirection);

  if (intensity > 0.98) {
    fragColor = vec4(0.8, 0.8, 0.8, 1.0);
  } else if (intensity > 0.5) {
    fragColor = vec4(0.8, 0.4, 0.4, 1.0);
  } else if (intensity > 0.25) {
    fragColor = vec4(0.6, 0.2, 0.2, 1.0);
  } else {
    fragColor = vec4(0.1, 0.1, 0.1, 1.0);
  }
}