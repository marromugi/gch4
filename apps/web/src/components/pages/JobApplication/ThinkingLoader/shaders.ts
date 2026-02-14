// 頂点シェーダー
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// フラグメントシェーダー - メタボールSDF
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;

// Smooth minimum (polynomial) - メタボールの滑らかな融合
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// 簡易ノイズ関数
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// 球体SDF（輪郭揺らぎ付き）
float sdSphere(vec2 p, vec2 center, float radius, float time) {
    vec2 dir = normalize(p - center);
    float angle = atan(dir.y, dir.x);

    // 角度と時間に基づく揺らぎ
    float wobble = noise(vec2(angle * 3.0, time * 0.004)) * 0.08;
    wobble += sin(angle * 5.0 + time * 0.006) * 0.03;

    return length(p - center) - radius - wobble;
}

// メタボールシーン - 3つの球体
float scene(vec2 p, float time) {
    float speed = 1.8;
    float t = time * 0.001 * speed;

    // 3つのメタボール位置（リサージュ曲線ベース）
    vec2 c1 = vec2(
        sin(t * 1.2) * 0.25,
        cos(t * 0.9) * 0.25
    );
    vec2 c2 = vec2(
        sin(t * 0.8 + 2.094) * 0.25,  // 2.094 = 2π/3
        cos(t * 1.1 + 2.094) * 0.25
    );
    vec2 c3 = vec2(
        sin(t * 1.0 + 4.189) * 0.25,  // 4.189 = 4π/3
        cos(t * 0.7 + 4.189) * 0.25
    );

    // 各球体の半径（時間で微妙に変化）
    float r1 = 0.35 + sin(t * 1.5) * 0.05;
    float r2 = 0.32 + sin(t * 1.8 + 1.0) * 0.05;
    float r3 = 0.33 + sin(t * 1.3 + 2.0) * 0.05;

    // SDF計算（時間を渡して輪郭を揺らす）
    float d1 = sdSphere(p, c1, r1, time);
    float d2 = sdSphere(p, c2, r2, time + 1000.0);
    float d3 = sdSphere(p, c3, r3, time + 2000.0);

    // スムーズに融合 (softness = 0.3)
    float d = smin(d1, d2, 0.3);
    d = smin(d, d3, 0.3);

    return d;
}

void main() {
    // 正規化座標 (-1 to 1)
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

    float d = scene(uv, u_time);

    // 等値面の描画（アンチエイリアス付き）
    float pixelSize = 2.0 / min(u_resolution.x, u_resolution.y);
    float alpha = smoothstep(pixelSize, -pixelSize, d);

    // currentColorを使うため、白で出力（CSS側でcolor継承）
    fragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`
