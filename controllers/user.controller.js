const { v4: uuidv4 } = require('uuid');
const { User } = require("../models/user.model");
const { Contact } = require("../models/contact.model");
const { jwt, bcrypt, verifyToken } = require("../auth/auth");
const { increaseUserCount } = require('./info.controller');


const register = async (req, res) => {
    console.log('Signup route');

    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }


    const { name, email, password, securityQuestion, securityAnswer } = req.body;
    console.log(name, email, password);


    // check if user already exists
    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
        return res.status(400).send({ message: "Email already exists!" });
    }


    // encrypt password and create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate user ID
    const userId = uuidv4();

    // create a new user
    const newUser = new User({
        userId: userId,
        name: name,

        email: email,
        password: hashedPassword,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer,

    })

    // generate a token and send it back to the user
    await newUser
        .save(newUser)
        .then((data) => {
            // generate jwt token
            increaseUserCount();
            const token = jwt.sign({ _id: data.userId }, process.env.TOKEN_SECRET, { expiresIn: '2h' });
            const user = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                token: token
            }

            res.status(201).send(user);
        })
        .catch((err) => {
            console.log(err)
            var errorCode = 0
            if (err.code === 11000) {
                errorCode = 11000
            }

            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User.",
                erroCode: errorCode
            });
        });


}


const login = async (req, res) => {
    console.log('Login route');
    const { email, password } = req.body;


    var code = ""
    // Validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    // Create a User

    const user = {
        userEmail: email?.toLowerCase(),
        password: password,
    };

    await User.findOne({ email: user.userEmail })
        .then((data) => {
            bcrypt.compare(user.password, data.password, function (err, result) {
                if (err) {
                    console.log(err)
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the User.",
                    });
                }
                else if (result) {
                    // generate jwt token
                    const token = jwt.sign({ _id: data.userId }, process.env.TOKEN_SECRET, { expiresIn: '2h' });
                    const user = {
                        userId: data.userId,
                        name: data.name,
                        email: data.email,
                        token: token
                    }
                    console.log("Login Successful", user)
                    // res.send("Login Successful")
                    res.status(201).send(user);

                }
                else {
                    return res.json({ message: 'Invalid Credentials', code: '1' });

                }
            });
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message: "Account doesn't exist!",
                code: '2'
            });
        });

}


const updateName = async (req, res) => {
    console.log('------------- UPDATE NAME ---------------')
    const { token, newName, email } = req.body;
    if (!token) {
        return res.status(400).send({ message: "Token is required!" });
    }
    if (!newName) {
        return res.status(400).send({ message: "New Name is required!" });
    }
    if (!email) {
        return res.status(400).send({ message: "Email is required!" });
    }


    const decoded = verifyToken(token);
    console.log(decoded)
    if (decoded) {
        await User.findOneAndUpdate({ email: email }, { name: newName }, { new: true })

            .then((data) => {
                if (!data) {
                    return res.status(404).send({
                        message: `Cannot update User with email=${email}. Maybe User was not found!`
                    });
                } else {
                    res.status(200).send({
                        message: "User was updated successfully."
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error updating User with email=" + email
                });
            });

    }
}

const updatePassword = async (req, res) => {
    console.log('------------- UPDATE PASSWORD ---------------')
    const { token, email, oldPassword, newPassword } = req.body;
    if (!token) {
        console.log('Token is required!')
        return res.status(400).send({ message: "Token is required!" });
    }

    if (!oldPassword) {
        console.log('Old Password is required!')
        return res.status(401).send({ message: "Old Password is required!" });
    }

    if (!newPassword) {
        console.log('New Password is required!')
        return res.status(401).send({ message: "New Password is required!" });
    }

    if (!email) {
        console.log(
            'Email is required!'
        )
        return res.status(401).send({ message: "Email is required!" });
    }


    const decoded = verifyToken(token);
    console.log(decoded)

    if (decoded) {
        const data = await User.findOne({ email: email });

        if (!data) {
            return res.status(404).send({ message: "User not found!" });
        }

        const currentPassword = data?.password
        const match = await bcrypt.compare(oldPassword, currentPassword);
        if (!match) {
            console.log('Invalid Password!')
            return res.status(401).send({ message: "Invalid Password!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email: email }, { password: hashedPassword }, { new: true })

            .then((data) => {
                if (!data) {
                    return res.status(404).send({
                        message: `Cannot update User with email=${email}. Maybe User was not found!`
                    });
                } else {
                    res.status(200).send({
                        message: "User was updated successfully."
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error updating User with email=" + email
                });
            });
    }
}

const deleteAccount = async (req, res) => {
    console.log('------------- DELETE ACCOUNT ---------------')
    const { token, email, password } = req.body;

    if (!token) {
        console.log('Token is required!')
        return res.status(400).send({ message: "Token is required!" });
    }

    if (!password || !email) {
        console.log('Password and Email is required!')
        return res.status(401).send({ message: "Password and Email is required!" });
    }



    const decoded = verifyToken(token);
    console.log(decoded)


    if (decoded) {
        //remove the user

        const data = await User.findOne({ email: email });

        if (!data) {
            console.log('User not found!')
            return res.status(404).send({ message: "User not found!" });
        }

        const currentPassword = data?.password

        const match = await bcrypt.compare(password, currentPassword);
        if (!match) {
            console.log('Invalid Password!')
            return res.status(401).send({ message: "Invalid Password!" });
        }

        await User.findOneAndDelete({ email: email })

            .then((data) => {
                if (!data) {
                    console.log('Cannot delete User with email=', email, '. Maybe User was not found!')
                    return res.status(404).send({

                        message: `Cannot delete User with email=${email}. Maybe User was not found!`
                    });
                } else {
                    res.status(200).send({
                        message: "User was deleted successfully."
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error deleting User with email=" + email
                });
            });

    }
}


const getSecurityQuestion = async (req, res) => {
    const { email } = req.body
    console.log('------------- GET SECURITY QUESTION ---------------')
    console.log(email)
    if (!email) {
        return res.status(400).send({ message: "Email is required!" });
    }

    const data = await User.findOne({ email: email })
    if (!data) {
        return res.status(404).send({ message: "User not found!" });
    }

    res.status(200).send({ securityQuestion: data.securityQuestion });
}

const forgotPassword = async (req, res) => {
    const { email, securityAnswer, newPassword } = req.body;
    console.log('------------- FORGOT PASSWORD ---------------')

    if (!email) {
        return res.status(400).send({ message: "Email is required!" });

    }

    if (!securityAnswer) {
        return res.status(400).send({ message: "Security Answer is required!" });

    }


    if (!newPassword) {
        return res.status(400).send({ message: "New Password is required!" });

    }

    const data = await User.findOne({ email: email })

    if (!data) {
        return res.status(404).send({ message: "User not found!" });
    }

    if (data.securityAnswer !== securityAnswer) {
        return res.status(401).send({ message: "Invalid Security Answer!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User
        .findOneAndUpdate({ email: email }, { password: hashedPassword }, { new: true })
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: `Cannot update User with email=${email}. Maybe User was not found!`
                });
            } else {
                res.status(200).send({
                    message: "Password was updated successfully."
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating User with email=" + email
            });
        });

}

const getUserDetail = async (req, res) => {
    const { token } = req.body;
    console.log('------------- GET USER DETAIL ---------------')
    if (!token) {
        return res.status(400).send({ message: "Token is required!" });
    }

    const decoded = verifyToken(token);
    console.log(decoded)


    if (decoded) {
        const data = await User.findOne({ userId: decoded._id });
        if (!data) {
            return res.status(404).send({ message: "User not found!" });
        }
        res.status(200).send({
            name: data.name,
            email: data.email,
            isPremiumUser: data.isPremiumUser
        });



    } else {
        return res.status(401).send({ message: "Invalid Token!" });

    }
}

const getContactFormDetail = async (req, res) => {
    const { name, email, subject, message } = req.body;
    console.log('------------- GET CONTACT FORM DETAIL ---------------')
    if (!name || !email || !subject || !message) {
        return res.status(400).send({ message: "All fields are required!" });
    }

    const newContact = new Contact({
        name: name,
        email: email,
        subject: subject,
        message: message
    })

    await newContact
        .save(newContact)
        .then((data) => {
            res.status(201).send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Contact Form.",
            });
        });



}
module.exports = { register, login, updateName, updatePassword, deleteAccount, getSecurityQuestion, forgotPassword, getUserDetail, getContactFormDetail };