in vec2 vTextureCoord;
out vec4 FragColor;

uniform sampler2D uSampler;
uniform float hwWidth;
uniform float hwHeight;
uniform float hwPi;
uniform float hwPi2;
uniform float hwDelta;
uniform float hwRandom;

$[lumins];
$[advancedBlendModes];

void main(void){
    vec4 color = texture(uSampler, vTextureCoord);
    vec4 light = texture(uSampler, vTextureCoord);
    vec4 def = texture(uSampler, vTextureCoord);
    vec4 vign = texture(uSampler, vTextureCoord);
    vec4 nextx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 nexty = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));
    vec4 prevx = texture(uSampler, vec2(vTextureCoord.x + (1. / hwWidth), vTextureCoord.y));
    vec4 prevy = texture(uSampler, vec2(vTextureCoord.x, vTextureCoord.y+ (1. / hwHeight)));
    

    float overall = lumins(color);
    for(float i=0.;i<overall;i+=(overall/15.)) {
        light = mix(light, texture(uSampler, vec2( vTextureCoord.x+(sin(i*hwPi)/(hwWidth*(.5-i))), vTextureCoord.y+(cos(i*hwPi2)/(hwHeight*(.5-i))))), 0.5);
    }

    nextx = blend_Multiply(nextx, prevx, overall);    
    nexty = blend_Multiply(nexty, prevy, overall); 
    color = mix(mix(nextx, color, 1.0-overall), mix(nexty, color, .25), overall);
    color *= blend_Add(color, vec4(overall*3., overall*5., overall, overall), overall);
    color = blend_Darken(vec4(lumins(light)), color, 0.5);

    float sepLums = lumins(color);
    vec4 sepia = vec4(sepLums, sepLums/(1.05), sepLums/1.25, color.a);

   float realSize = 1.+(hwWidth/2048.);
   float lum = lumins(color);
  
    vign *= (max(0., min(1., (realSize*sin((vTextureCoord.x)*hwPi)))));
    vign *= (max(0., min(1., (realSize*sin((vTextureCoord.y)*hwPi)))));

    FragColor = mix(blend_Darken(sepia, color, 0.15), mix(def, vign, .9), overall);
    FragColor = mix(FragColor, def, 0.5);


}