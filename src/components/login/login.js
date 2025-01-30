function LoginForm(){

    return(
        <div>
            <label htmlFor="username">Username :</label>
            <input type="text" id="username" name="username"></input>
            <label htmlFor="password">Password :</label>
            <input type="text" id="password" name="password"></input>
        </div>
    );
}

export default LoginForm;