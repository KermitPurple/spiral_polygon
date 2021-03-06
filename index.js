// parse location
let GET = {};
for(const item of window.location.search.split(/&|\?/).filter(substr => substr)){
    let [key, val] = item.split('=').map(decodeURIComponent);
    GET[key] = val;
}
let qr_code = null;

let els = {
    'sides': document.querySelector('#sides'),
    'delta_theta': document.querySelector('#delta-theta'),
    'stroke_weight': document.querySelector('#stroke-weight'),
    'max_length': document.querySelector('#max-length'),
    'checkboxes': {
        'slider': document.querySelector('#slider-checkbox'),
        'color_anim': document.querySelector('#color-anim'),
    },
    'color_offset': document.querySelector('#color-offset'),
    'share_link': document.querySelector('#share-link'),
    'increase_speed': document.querySelector('#increase-speed'),
    'qr_code': document.querySelector("#qr-code"),
    'color_type': document.querySelector('#color-type'),
};

function setup(){
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    colorMode(HSL);
    els.sides.addEventListener('input', ()=>{
        validate_min(els.sides);
        reset_delta_theta();
        redraw();
    });
    els.delta_theta.addEventListener('input', redraw);
    els.stroke_weight.addEventListener('input', ()=>{
        validate_min(els.stroke_weight);
        strokeWeight(els.stroke_weight.value);
        redraw();
    });
    els.max_length.addEventListener('input', redraw);
    els.checkboxes.slider.addEventListener('change', ()=>{
        let type = "number";
        if(els.checkboxes.slider.checked)
            type = 'range';
        els.delta_theta.type = type;
        els.stroke_weight.type = type;
        els.max_length.type = type;
        els.color_offset.type = type;
        els.increase_speed.type = type;
    });
    els.checkboxes.color_anim.addEventListener('change', ()=>{
        if(els.checkboxes.color_anim.checked){
            loop();
        } else {
            noLoop();
        }
    });
    els.color_offset.addEventListener('input', redraw);
    els.increase_speed.addEventListener('input', ()=>{
        validate_min(els.increase_speed);
        redraw();
    });
    els.color_type.addEventListener('input', redraw);
    noLoop();
    load_from_get();
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){
    update_share_link();
    background(0);
    translate(windowWidth / 2, windowHeight / 2);
    let pos = createVector();
    let angle = 0;
    let sides = parseFloat(els.sides.value);
    let max_size = parseFloat(els.max_length.value);
    let delta_theta = parseFloat(els.delta_theta.value);
    let increase = parseFloat(els.increase_speed.value);
    for(let i = 0; i < max_size; i += increase){
        let c;
        switch(els.color_type.value){
            default:
            case 'spiral':
                c = calculate_rainbow(i / increase, sides);
                break;
            case 'gradient':
                c = calculate_rainbow(i / increase, max_size);
                break;
        }
        stroke(c);
        pos = draw_line_at_angle(pos, angle, i);
        angle += delta_theta;
        angle %= 360;
    }
    if(els.checkboxes.color_anim.checked){
        let val = parseFloat(els.color_offset.value);
        els.color_offset.value = (val + 1) % 360;
    }
}

function draw_line_at_angle(start, angle, length) {
    let end = createVector(
        start.x + cos(angle) * length,
        start.y + sin(angle) * length,
    );
    line(start.x, start.y, end.x, end.y);
    return end
}

function calculate_rainbow(current, max) {
    let offset = parseFloat(els.color_offset.value);
    return color(
        (current % max / max * 360 + offset) % 360,
        100,
        50,
    );
}

function reset_delta_theta(default_value){
    els.delta_theta.value = default_value ?? 360 / parseFloat(els.sides.value) - 0.1;
}

function reset(defaults = {}){
    els.sides.value = defaults.sides ?? 6;
    reset_delta_theta(defaults.deltaTheta);
    els.delta_theta.value = defaults.deltaTheta ?? 360 / parseFloat(els.sides.value) - 0.1;
    els.max_length.value = defaults.maxLen ?? 3000;
    els.stroke_weight.value = defaults.strokeWeight ?? 1;
    strokeWeight(els.stroke_weight.value);
    els.color_offset.value = defaults.colorOffset ?? 0;
    if(defaults?.colorAnim === 'true' && !els.checkboxes.color_anim.checked)
        els.checkboxes.color_anim.click();
    els.increase_speed.value = defaults.increaseSpeed ?? 1;
    els.color_type.value = defaults.colorType ?? 'spiral';
    redraw();
}

function load_from_get(){
    reset(GET);
}

function make_share_link(){
    let url = location.href.split(/\?/)[0];
    return `${url}?\
sides=${els.sides.value}&\
deltaTheta=${els.delta_theta.value}&\
maxLen=${els.max_length.value}&\
strokeWeight=${els.stroke_weight.value}&\
increaseSpeed=${els.increase_speed.value}&\
colorOffset=${els.color_offset.value}&\
colorAnim=${els.checkboxes.color_anim.checked.toString()}&\
colorType=${els.color_type.value}`;
}

function update_share_link(){
    els.share_link.href = make_share_link();
}

function validate_min(el){
    if(parseFloat(el.value) < el.min)
        el.value = el.min;
}

function validate_max(el){
    if(parseFloat(el.value) > el.max)
        el.value = el.max;
}

function gen_qr_code(){
    if(qr_code != null)
        return
    qr_code = new QRCode(els.qr_code, {
        text: make_share_link(),
        colorDark : "#000000",
        colorLight : "#ffffff",
    });
    els.qr_code.focus();
    els.qr_code.classList.remove('hidden');
}

function delete_qr_code(){
    if(qr_code == null)
        return
    let child = els.qr_code.querySelector('img');
    els.qr_code.removeChild(child);
    qr_code = null;
    els.qr_code.classList.add('hidden');
}
