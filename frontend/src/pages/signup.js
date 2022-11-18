import { useState, useEffect } from 'react';
import React from 'react';

const Signup = () => {

    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');


    const addPosts = async (user, pass) => {
        await fetch('http://localhost:3030/signup', {
            method: 'POST',
            body: JSON.stringify({
                title: '',
                body: '',
                userId: Math.random().toString(36).slice(2)
            }),
            // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            // res.setHeader('Access-Control-Allow-Origin', "*");
            // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
            // res.setHeader('Access-Control-Allow-Credentials', true)
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': 'http://localhost:3000'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(user);
        console.log(pass);
        addPosts(user, pass);
    };

    return (
        <div className="app">
            <div className="add-post-container">
                <h1><center>Log In or Sign Up Here!</center></h1>
                <center>
                    <form onSubmit={handleSubmit}>
                        <label for="user" > Username or Email: </label><br></br>
                        <input type="text" className="form-control" value={user} onChange={(e) => setUser(e.target.value)} /><br></br>
                        <label for="pass" > Password: </label><br></br>
                        <input type="text" className="form-control" value={pass} onChange={(e) => setPass(e.target.value)} /><br></br>
                        <button type="submit">Signup</button>
                    </form>
                </center>
            </div>
        </div>
    );

};

export default Signup;