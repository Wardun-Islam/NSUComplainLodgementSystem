import "./App.css";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import Home from "./Components/Home";
import Profile from "./Components/Profile";
import EditProfile from "./Components/EditProfile";
import ClassPage from "./Components/ClassPage";
import AssignmentPage from "./Components/AssignmentPage";
import PdfViewer from "./Components/PdfViewer";
import { PrivateRoute } from "./Components/PrivateRoute";
import { UserProtectedRoute } from "./Components/UserProtectedRoute";
import { BrowserRouter as Router, Switch } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <PrivateRoute path="/home" exact={true} component={Home} />
          <PrivateRoute path="/profile" exact={true} component={Profile} />
          <PrivateRoute
            path="/editprofile"
            exact={true}
            component={EditProfile}
          />
          <PrivateRoute
            path="/class:class_id"
            exact={true}
            component={ClassPage}
          />
          <PrivateRoute
            path="/assignment:assignment_id"
            exact={true}
            component={AssignmentPage}
          />
          <UserProtectedRoute path="/signin" exact={true} component={SignIn} />
          <UserProtectedRoute path="/" exact={true} component={SignIn} />
          <UserProtectedRoute path="/signup" exact={true} component={SignUp} />
        </Switch>
        {/* <PdfViewer  /> */}
      </div>
    </Router>
  );
}

export default App;
