function check(){
	document.getElementById("homework_today").innerHTML = localStorage.getItem("publish");
}

//创建JS Node
function createJSNode (audioContext) {
    const BUFFER_SIZE = 4096;
    const INPUT_CHANNEL_COUNT = 2;
    const OUTPUT_CHANNEL_COUNT = 2;
    // createJavaScriptNode已被废弃
    let creator = audioContext.createScriptProcessor;
    creator = creator.bind(audioContext);
    return creator(BUFFER_SIZE,
                    INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
}

//录音function
var mediaValue
function beginRecord (mediaStream) {
	leftDataList = [];
	rightDataList = [];//决定是否重录
	mediaValue = mediaStream;
    let audioContext = new (window.AudioContext || window.webkitAudioContext);
 	mediaNode = audioContext.createMediaStreamSource(mediaStream);
    // 创建一个jsNode
    jsNode = createJSNode(audioContext);
    // 需要连到扬声器消费掉outputBuffer，process回调才能触发
    // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
    jsNode.connect(audioContext.destination);
    jsNode.onaudioprocess = onAudioProcess;
    // 把mediaNode连接到jsNode
    mediaNode.connect(jsNode);
}

//开始录音function
function record () {
    window.navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(mediaStream => {
        console.log(mediaStream);
        beginRecord(mediaStream);
    }).catch(err => {
        // 如果用户电脑没有麦克风设备或者用户拒绝了，或者连接出问题了等
        // 这里都会抛异常，并且通过err.name可以知道是哪种类型的错误
        console.error(err);
    })  ;
    document.getElementById("end").style.display = "inline-block";
    document.getElementById("upload").style.display = "none";
}

//存储录音数据
let leftDataList = [],
    rightDataList = [];

function onAudioProcess (event) {
    let audioBuffer = event.inputBuffer;
    let leftChannelData = audioBuffer.getChannelData(0),
        rightChannelData = audioBuffer.getChannelData(1);
    // 需要克隆一下
    leftDataList.push(leftChannelData.slice(0));
    rightDataList.push(rightChannelData.slice(0));
}

//MergeData
function mergeArray (list) {
    let length = list.length * list[0].length;
    let data = new Float32Array(length),
        offset = 0;
    for (let i = 0; i < list.length; i++) {
        data.set(list[i], offset);
        offset += list[i].length;
    }
    return data;
}

// 交叉合并左右声道的数据
function interleaveLeftAndRight (left, right) {
    let totalLength = left.length + right.length;
    let data = new Float32Array(totalLength);
    for (let i = 0; i < left.length; i++) {
        let k = i * 2;
        data[k] = left[i];
        data[k + 1] = right[i];
    }
    return data;
}

//创建wav文件
function writeUTFBytes (view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function createWavFile (audioData) {
    const WAV_HEAD_SIZE = 44;
    let buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE),
        // 需要用一个view来操控buffer
        view = new DataView(buffer);
    // 写入wav头部信息
    // RIFF chunk descriptor/identifier
    writeUTFBytes(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 44 + audioData.length * 2, true);
    // RIFF type
    writeUTFBytes(view, 8, 'WAVE');
    // format chunk identifier
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    // sample rate
    view.setUint32(24, 44100, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, 44100 * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2 * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data sub-chunk
    // data chunk identifier
    writeUTFBytes(view, 36, 'data');
    // data chunk length
    view.setUint32(40, audioData.length * 2, true);

	// 写入PCM数据
    let length = audioData.length;
    let index = 44;
    let volume = 1;
    for (let i = 0; i < length; i++) {
        view.setInt16(index, audioData[i] * (0x7FFF * volume), true);
        index += 2;
    }
    return buffer;
}



function stopRecord () {
    // 停止录音
	let mediaStream = mediaValue;
	mediaStream.getAudioTracks()[0].stop();
    mediaNode.disconnect();
    jsNode.disconnect();

	//存储数据
    let leftData = mergeArray(leftDataList),
        rightData = mergeArray(rightDataList);
    let allData = interleaveLeftAndRight(leftData, rightData);
    let wavBuffer = createWavFile(allData);
	let blob = new Blob([new Uint8Array(wavBuffer)]);
    let blobUrl = URL.createObjectURL(blob);
	localStorage.setItem("record", blobUrl);
    console.log("execute1 check")
    // if (localStorage.getItem("record")) {
    //     localStorage.setItem("record2", blobUrl);
    // } else {
    //     localStorage.setItem("record", blobUrl);
    // }
    console.log("execute2 check")
    document.getElementById("play").style.display = "inline-block";
    document.getElementById("file-upload").style.display = "inline-block";
    document.getElementById("rerecord").style.display = "inline-block";
    document.getElementById("end").style.display = "none";

    

}

function playRecord () {
	blobUrl = localStorage.getItem("record")
    console.log("link", blobUrl)
    document.querySelector('.audio-node').src = blobUrl;
    console.log("execute3 check")
}

function rerecord(){

    window.location.reload();
}

function playAgain(){
    console.log("link", blobUrl)
    blobUrl = localStorage.getItem("record")
    console.log("check",blobUrl)
    document.querySelector('.audio-node').src = blobUrl;
}
function upload(){
    alert("已上传")   

}