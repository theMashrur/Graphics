#version 300 es

precision highp float;

// A texture sampling unit, which is bound to the render quad texture buffer
uniform sampler2D textureRendered;

// Texture coordinates coming from the vertex shader, interpolated through the rasterizer
in vec2 fragmentTextureCoordinates;
out vec4 fragColor;

// Constants for the radial blur as defined in the spec
const float dMax = 0.3;
const int n = 12;
const float s[n] = float[](-0.10568, -0.07568, -0.042158, -0.02458, -0.01987456, -0.0112458, 0.0112458, 0.01987456, 0.02458, 0.042158, 0.07568, 0.10568);

// Main program for each fragment of the render quad
void main() {
  // Calculate the normalized vector from the center of the texture to the current fragment, using normalized co-ordinates
  vec2 center = vec2(0.5, 0.5);
  vec2 p = center - fragmentTextureCoordinates;
  vec2 pNorm = normalize(p);

  // Sample the texture at multiple positions and sum the values according to the formula
  vec3 sumAccumulator = vec3(0.0);
  for (int i = 0; i < n; i++) {
    float d = s[i] * dMax;
    vec2 sumTerm = fragmentTextureCoordinates + pNorm * d;
    sumAccumulator += texture(textureRendered, sumTerm.xy).xyz;
  }

  // Calculate the blurred color value and set the output color, making sure to divide by n, as in the formula
  vec3 rgb_blur = sumAccumulator / float(n);
  fragColor = vec4(rgb_blur, 1.0);
}