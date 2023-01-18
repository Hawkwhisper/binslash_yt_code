in vec2 vTextureCoord;
out vec4 FragColor;

uniform sampler2D uSampler;

float lumins(vec4 color) {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

void main(void){
    vec4 color = texture(uSampler, vTextureCoord);

    float overall = lumins(color);
    if(overall>=.5) {
        color = vec4(1.);
    } else {
        color = vec4(0.);
    }

    FragColor = color;
}