import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import profileImage from "../images/profile_image.png";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import LoadingPage from "./LoadingPage";
import TopAppBar from "./AppBar";
import { getUser } from "./ApiRequestHandler";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(3),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	edit: {
		marginTop: theme.spacing(1),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		width: 100,
		height: 100,
		backgroundColor: theme.palette.secondary.main,
	},
	btn: {
		width: "100%",
	},
}));

function Profile() {
	const classes = useStyles();
	const [user, setUser] = React.useState(null);
	const [hasUser, setHasUser] = React.useState(false);
	const [hasError, setHasError] = React.useState(false);
	const history = useHistory();

	const editProfile = () => {
		history.push("/editprofile");
	};

	useEffect(() => {
		getUser({ token: window.localStorage.getItem("token") })
			.then(function (response) {
				console.log(response.data.user);
				setUser(response.data.user);
				setHasUser(true);
			})
			.catch(function (error) {
				setHasUser(false);
				setHasError(true);
				console.log(error);
			});
	}, []);

	return (
		<div>
			<TopAppBar title={"Profile"} />
			{hasUser ? (
				<Container component="main" maxWidth="xs">
					<CssBaseline />
					<Box display="flex" flexDirection="Column" p={3}>
						<div className={classes.paper}>
							<Avatar
								alt={user.first_name}
								src={
									user.user_image
										? user.user_image
										: profileImage
								}
								className={classes.avatar}
							/>
						</div>
						<Box p={1}>
							<Box textAlign="left" mb={1}>
								First Name
							</Box>
							<Box
								textAlign="left"
								p={2}
								color="#11052C"
								bgcolor="#F3F1F5"
							>
								{user.first_name}
							</Box>
						</Box>
						<Box p={1}>
							<Box textAlign="left" mb={1}>
								Last Name
							</Box>
							<Box
								textAlign="left"
								p={2}
								color="#11052C"
								bgcolor="#F3F1F5"
							>
								{user.last_name}
							</Box>
						</Box>

						<Box p={1}>
							<Box textAlign="left" mb={1}>
								Email
							</Box>
							<Box
								textAlign="left"
								p={2}
								color="#11052C"
								bgcolor="#F3F1F5"
							>
								{user.email}
							</Box>
						</Box>
						<Box p={1}>
							<Box textAlign="left" mb={1}>
								Account Type
							</Box>
							<Box
								textAlign="left"
								p={2}
								color="#11052C"
								bgcolor="#F3F1F5"
							>
								{user.account_type}
							</Box>
						</Box>
						<Box p={1}>
							<Button
								className={classes.btn}
								variant="contained"
								color="primary"
								onClick={editProfile}
							>
								Edit Profile
							</Button>
						</Box>
					</Box>
				</Container>
			) : hasError ? (
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					minHeight="100vh"
				>
					Failed to get user info. Please try again.
				</Box>
			) : (
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					minHeight="100vh"
				>
					<LoadingPage />
				</Box>
			)}
		</div>
	);
}

export default Profile;
