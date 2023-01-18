in vec2 vTextureCoord;
out vec4 FragColor;

uniform sampler2D uSampler;

$[lumins];
$[advancedBlendModes];

void main(void){
    vec4 color = texture(uSampler, vTextureCoord);
    
    float overall = lumins(color);
    overall = overall * (0.35 + overall);
    color = vec4(round(.9*overall));
        if(overall < 1. && mod(gl_FragCoord.x, overall*5.) >= 1. && mod(gl_FragCoord.y, overall*5.) >= 1.) {
            discard;
        }
    FragColor = color;
}