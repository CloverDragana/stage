import FormRow from "@/components/login/login-form-row";

function SignUpForm(){ 
    const handleSignUpForm = async (event) => { 
        event.preventDefault(); 

        try {

            const formData = new FormData(event.target); 

            const userInfo = { 
                fName: formData.get('fName'), 
                lName: formData.get('lName'), 
                email: formData.get('email'), 
                username: formData.get('username'), 
                password: formData.get('password')
            }; 
         
            const response = await fetch('/api/register-user', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', }, 
                body: JSON.stringify(userInfo), 
            }); 

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ||"registration failed");
            }

            console.log('sign up successful');
        } catch (error){ 
            console.log('registration error', error); 
            alert('Try Again signup component'); 

            if (error.message.includes('email already registered')) {
                alert('This email is already registered. Please use a different email.');
              } else if (error.message.includes('username already taken')) {
                alert('This username is already taken. Please choose a different username.');
              } else if (error.message.includes('Invalid email')) {
                alert('Please enter a valid email address.');
              } else {
                alert(error.message || 'Registration failed. Please try again.');
              }
        } 
    };

    return(
        <form onSubmit={handleSignUpForm} className="w-full">
            <FormRow label="First Name" id="fName" name="fName" type="text" />
            <FormRow label="Last Name" id="lName" name="lName" type="text" />
            <FormRow label="Email Address" id="email" name="email" type="email" />
            <FormRow label="Username" id="username" name="username" type="text" />
            <FormRow label="Password" id="password" name="password" type="password"/>
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Start Your Adventure</button>
            </div>
        </form>
    );
    return('Start Your Adventure'); 
} 
export default SignUpForm;