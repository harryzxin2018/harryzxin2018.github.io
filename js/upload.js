function login(){
	var name = document.getElementById("name").value;
	var password = document.getElementById("password").value;
	if (name == "teacher_test" && password == "123456") {
    window.open("teacher_page.html","_self");
  } else {
    alert("用户名或密码有误");
  }



}