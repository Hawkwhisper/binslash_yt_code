in vec2 vTextureCoord;
out vec4 FragColor;

uniform sampler2D uSampler;
uniform float hwWidth;
uniform float hwHeight;
uniform float hwPi;
uniform float hwDelta;
uniform float hwRandom;

$[lumins];
$[advancedBlendModes];

void main(void){
    vec4 color = texture(uSampler, vTextureCoord);
    vec4 nextx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 nexty = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));
    vec4 prevx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 prevy = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));
   

    float overall = lumins(color);

    nextx = blend_HeavensLight(nextx, prevx, overall);    
    nexty = blend_HeavensLight(nexty, prevy, overall); 
    float onx = lumins(nextx);
    float ony = lumins(nexty);
    float pvx = lumins(prevx);
    float pvy = lumins(prevy);

    float maxnum = floor(((onx+pvx+ony+pvy/overall)));
    float xmod = floor(mod(gl_FragCoord.x, round(maxnum+color.a)));
    float ymod = floor(mod(gl_FragCoord.y, round(maxnum+color.a)));
    if(xmod == 0. && ymod == 0. && floor(mod(gl_FragCoord.y, 2.)) == 0. && floor(mod(gl_FragCoord.x, 2.)) == 0. ) {
        if(overall < .5) {
            color *= (2.5-overall);
        } else {
            color /= (2.5-overall);
        }
         
    }
    overall = round(lumins(color));

    color = vec4(overall);
    if(color.r < 1.) {
        color = vec4(0.1,0.15,0.2, 1.);
    } else {
        color = vec4(0.8,0.85,0.9, 1.);
        
    }
    FragColor = color;
}