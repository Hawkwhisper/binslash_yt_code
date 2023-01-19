in vec2 vTextureCoord;
out vec4 FragColor;

uniform sampler2D uSampler;
uniform float hwWidth;
uniform float hwHeight;

$[lumins];
$[advancedBlendModes];

void main(void){
    vec4 color = texture(uSampler, vTextureCoord);
    vec4 nextx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 nexty = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));
    vec4 prevx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 prevy = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));

    
    float overall = floor(lumins(color)*7.)/7.;

    float onx = floor(lumins(nextx)*7.)/7.;
    float ony = floor(lumins(nexty)*7.)/7.;
    float pvx = floor(lumins(prevx)*7.)/7.;
    float pvy = floor(lumins(prevy)*7.)/7.;

    if((onx != overall || pvx != overall)&& mod(gl_FragCoord.x, overall*2.)>=overall && mod(gl_FragCoord.y, overall*2.)>=overall) {
        color -= 0.5;
    }
    overall = round(lumins(color));


    color = vec4(overall);

    FragColor = color;
}