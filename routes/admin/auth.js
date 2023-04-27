const express = require("express");
const { check, validationResult } = require("express-validator");

const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
	requireEmail,
	requirePassword,
	requirePasswordConfirmation,
	requireEmailExists,
	requireValidPasswordForUser,
} = require("./validators");

const router = express.Router();

router.get("/signup", (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post(
	"/signup",
	[requireEmail, requirePassword, requirePasswordConfirmation],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.send(signupTemplate({ req, errors }));
		}

		const { email, password, passwordConfirmation } = req.body;

		// Create a user in our user repo to represent this person
		const user = await usersRepo.create({ email, password });

		// Store the if of that user inside the users cookie
		req.session.userId === user.id; // Added by cookie session

		res.send("Account created!");
	}
);

router.get("/signout", (req, res) => {
	req.session = null;
	res.send("You are logged out");
});

router.get("/signin", (req, res) => {
	res.send(signinTemplate({}));
});

router.post(
	"/signin",
	[requireEmailExists, requireValidPasswordForUser],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.send(signinTemplate({ errors }));
		}

		const { email } = req.body;

		const user = await usersRepo.getOneBy({ email });

		req.session.userId = user.id;

		res.send(`You are signed in!!!`);
	}
);

module.exports = router;
