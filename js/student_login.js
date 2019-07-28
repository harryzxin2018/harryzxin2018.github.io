function login(){
	var name = document.getElementById("name").value;
	var password = document.getElementById("password").value;
	if (name == "student_test" && password == "123456") {
    window.open("upload.html","_self");
  } else {
    alert("用户名或密码有误");
  }



}