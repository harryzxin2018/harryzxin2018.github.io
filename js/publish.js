function check(){
	document.getElementById("homework").value =  localStorage.getItem("publish");

}

function publish(){
	var homework = document.getElementById("homework").value;
	localStorage.setItem("publish",homework);
	alert(localStorage.getItem("publish"))
	document.getElementById("homework").value =  localStorage.getItem("publish")
}