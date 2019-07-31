
function check(){
	if (localStorage.getItem("record")) {
		document.getElementById("test1").style.display = "inline-block";
		document.getElementById("test2").style.display = "inline-block";
	}

}


function play(){
	blobUrl = localStorage.getItem("record")
	blobUrl = "http://localhost/" + blobUrl
    console.log("link", blobUrl)
    document.querySelector('.audio-node').src = blobUrl;
    console.log("execute3 check")


}

function back(){
	window.open("view.html","_self")
}