
const express = require("express");
const admin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const https = require('https');
const fs = require('fs');

const app = express();
app.use(cookieParser());

var key="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcUvmfaU9F9pw6\nkvdOt3njIooKWDtjBFpEdH3SfoBNbkJ/J22zAJqFxUMIsAnBJKAa0n8/Qg5PaBjM\nBDtHpJczpq6DZQg7eQ9ovPR8HF1yloKthXUqZ+9GKaWmbW3BoGTK7j9dLFBnkAx1\nDrWjd29vj07BaZG1FFDl/Ax6nixwMXYAjQiKVVvhEWfUB3OAa/HOiohi6Qnt4xaX\nIz5GPuQpoCRXma2tYrGisy9T4vXCedYxc43wsGUrLoOWQuwq+s0lGpAfUdU11bBJ\n2jPGm3e6gPYOGGa0dW/Y7eGEH+Yfkxt+vETJQK4FF0cOUBx9AsHm6Q0fxeV5GS1Z\nf5QAGXXzAgMBAAECggEADsNynad5W+dQBa7GapxpyvoMBPBvnk1y3QZvTfUTFN0w\nEIQsWiPOtusGeGUPakVRgyqawzriaZjAnJ8l98GELj5bkEtrV0zf5vVObqiZ7G1A\neW8pcDuBsZJl2raXdbORPXXkghJPmvjwlMF1E2yT54ZTUSuJS3h+iUKv9WF2+dd+\nzC/Qd/n/SSXbJI1JYtLJC1vT3QUrD03yn8nbs0E9YVqDBS7Nw7RP8kH/LCjTT2YW\ngjKVA6HmIOdyrxisA3xELtQj7EskaznCU3KvySPq8pZcC4Y38HF4zePph4hBsTih\nvJR2OvBvk3xcik23L2SMlb2GVDwoQhu1T6EcQxN/iQKBgQDt0Do0boGH3mh1c7T+\nXI2vCLKUjpBDIwY5COOA78gTsN48vsBjnyiSUhXu4Ib46dKb/rm1BE/KpiD5elxw\nfeM8/BGtxckQK4ocrD7xqSVcZkCi8rOjTgtrZcpxvE+9EpUjT4XQisCvK4t2srN0\nO+7yjFsdHY4GsuQN6DJpGA3a6wKBgQDtLFpeXbs2bpzr0tEEtn9z4KMnZlflv5UU\nfAD8fkDpy5IrPIVKQlZ5ScwQ9fBgv/iy/yjE8eue38ihXaozQ+meB2FF5C8KzBWu\nL5MzM6jgRsvnJwmBZr1sGvSaDBagD2R0GyXZ6legLye4iPM5olttDWytMCexo42t\nQNWNw03/GQKBgDUp9skf5y8zplCThGPU1wvJOvsA//kyTELV3N5HPIhCYvxbfHEI\n9K35UdPsN+BPjXi4MlXoV9oq13ZOR3oSeol4pI8fhzppMWAFlbC6qpKEfXCwJz6b\nxOvGfsJ8YasYC2Uwcu7TBg5jArOPcZTLjTiF7hyNLeILffYp8ZMTAI3vAoGBAMji\n5nBDiAzkx/lfCTeqtG2b+dWndA/fpBBDsDotXiIpEVeZ3XQ2mDQHc9dx2Pa545cJ\nVKjsGBzrg25afY0KmtgFfDjMu6OzlTGCjnWx7fp5PMA/ame2c/8bHc9VKdzM7NMD\nI55eRXYiOsytAwbwI+xMkJ5oyVZHJ/t1jOyUXn4RAoGBALtwGHiAtMmfecL0QDEf\n1xShTVy/b8Ub7SQnLKOBvXMwtZSIeA5HK2twDdqaRHA4EI2DBNLxy9A3wGOLdUnN\nPTstReaKIA71cJPYl2DolAuGFpfUihvgaz1kgd1uxbcRXywvLiNg3GR9V45pq77a\n5Kda+fqZwVJi53zFKlxCuR1e\n-----END PRIVATE KEY-----\n";

admin.initializeApp({
    credential: admin.credential.cert({

        "private_key": key.replace(/\\n/g, '\n'),
        "client_email": "firebase-adminsdk-v9n47@auth-app-ec99a.iam.gserviceaccount.com",
        "project_id": "auth-app-ec99a"
    })
});

app.get('/',(req,res)=>{

    res.sendFile(__dirname +'/login.html');  //You can use render in case of ejs 
});


app.get('/logout',(req,res)=>{
    res.clearCookie('__session');
    res.redirect('/');
});

app.get('/success',checkCookie,(req,res)=>{
    res.sendFile(__dirname + '/success.html');
    console.log("UID of Signed in User is" + req.decodedClaims.uid);
    //You will reach here only if session is working Fine
});

app.get('/savecookie',(req,res)=>{
    const Idtoken=req.query.idToken;
    console.log(Idtoken);
    savecookie(Idtoken,res);
});

//saving cookies and verify cookies
// Reference : https://firebase.google.com/docs/auth/admin/manage-cookies

function savecookie(idtoken,res){

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth().createSessionCookie(idtoken,{expiresIn})
    .then((sessionCookie)=>{
        const options = {maxAge: expiresIn, httpOnly: true, secure: true};
        res.cookie('__session', sessionCookie, options);
	
        admin.auth().verifyIdToken(idtoken).then(function(decodedClaims){
            res.redirect('/success');
        });

    },error=>{
        console.log(error);
        res.status(401).send("UnAuthorised Request");

    });
}


function checkCookie(req,res,next){


	const sessionCookie = req.cookies.__session || '';
	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/login');
		});

}

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
  .listen(3000, function () {
    console.log('My Bloggerlistening on port 3000! Go to https://localhost:3000/')
  });

