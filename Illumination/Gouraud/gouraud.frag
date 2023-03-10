#version 300 es

// For better performance less precision
precision highp float;
out vec4 fragColor;

// Interpolated color from vertex shader
in vec4 color;

// Main program for each fragment = pixel candidate
void main() {
fragColor = color;
}