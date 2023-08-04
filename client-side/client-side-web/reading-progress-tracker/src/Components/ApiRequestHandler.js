const axios = require("axios").default;

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

export const signIn = ({ email, password }) => {
  return axios.post("/signin", {
    email: email,
    password: password,
  });
};

export const isUser = ({ token }) => {
  console.log(token);
  return axios.post("/verifygoogleuser", {
    google_token: token,
  });
};

export const googleRegister = ({ token, account_type }) => {
  return axios.post("/register/", {
    google_token: token,
    account_type: account_type,
  });
};

export const googleSignIn = ({ token }) => {
  return axios.post("/signin", {
    google_token: token,
  });
};

export const signUp = ({
  firstName,
  lastName,
  email,
  password,
  password2,
  accountType,
  image,
}) => {
  let formData = new FormData();
  formData.append("first_name", firstName);
  formData.append("last_name", lastName);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("retyped_password", password2);
  formData.append("account_type", accountType);
  if (image) {
    formData.append("user_image", image, image.name);
    console.log("image");
  }
  //body.append("Content-Type", "image/png");
  console.log(formData);
  return axios.post("/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data; ",
    },
  });
};

export const postAssignment = ({ postDescription, pdf, class_id, token }) => {
  let formData = new FormData();
  formData.append("post_description", postDescription);
  formData.append("class_id", class_id);
  formData.append("pdf", pdf);
  //body.append("Content-Type", "image/png");

  return axios.post("/addassignment", formData, {
    headers: {
      jwt_token: token,
      "Content-Type": "multipart/form-data; ",
    },
  });
};

export const postCommentRecord = ({ assignmentId, recordBlob, token }) => {
  let formData = new FormData();
  formData.append("assignmentId", assignmentId);
  formData.append("recordBlob", recordBlob);

  return axios.post("/post/comment_record", formData, {
    headers: {
      authorization: token,
      "Content-Type": "multipart/form-data; ",
    },
  });
};

export const getStudents = ({ assignment_id, token }) => {
  return axios.post(
    "/get/students",
    { assignment_id: assignment_id },
    {
      headers: {
        authorization: token,
      },
    }
  );
};

export const getStudentImage = ({ assignment_id, student_id }) => {
  return axios.post(
    "/get/students/images",
    { assignment_id: assignment_id, student_id: student_id },
    {
      headers: {},
    }
  );
};

export const postAssignmentStudentImage = ({
  assignmentId,
  page_number,
  image,
  token,
}) => {
  let formData = new FormData();
  formData.append("assignmentId", assignmentId);
  formData.append("image", image);
  formData.append("page_number", page_number);

  return axios.post("/post/assignment_student_image", formData, {
    headers: {
      jwt_token: token,
      "Content-Type": "multipart/form-data; ",
    },
  });
};

export const getAssignments = ({ class_id, token }) => {
  return axios.post(
    "/getclassroomassignments",
    { class_id: class_id },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const getAssignment = ({ assignment_id, token }) => {
  return axios.post(
    "/getassignmentdetails",
    { assignment_id: assignment_id },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const getComments = ({ assignment_id, token }) => {
  return axios.post(
    "/getcomments",
    { assignment_id: assignment_id },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const getUser = ({ token }) => {
  return axios.post(
    "/userinfo",
    {},
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const createClassroom = ({ classroomName, section, token }) => {
  return axios.post(
    "/addclassroom",
    { class_room_name: classroomName, section: section },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const joinClassroom = ({ classCode, token }) => {
  return axios.post(
    "/joinclassroom",
    { class_code: classCode },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const postComment = ({ assignmentId, comment, token }) => {
  console.log(assignmentId,comment);
  return axios.post(
    "/addcomment",
    { assignment_id: assignmentId, comment: comment },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const getClassroom = ({ token }) => {
  return axios.post(
    "/getclassrooms",
    {},
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const getClassInfo = ({ token, class_id }) => {
  return axios.post(
    "/getclassroomdetails",
    { class_code: class_id },
    {
      headers: {
        jwt_token: token,
      },
    }
  );
};

export const updateProfile = ({
  firstName,
  lastName,
  accountType,
  image,
  token,
}) => {
  let formData = new FormData();
  formData.append("first_name", firstName);
  formData.append("last_name", lastName);
  if (typeof image === "object" && image != null) {
    formData.append("user_image", image, image.name);
  } else {
    if (image == null) formData.append("delete_teacher_image", true);
  }

  return axios.post("/updateUser", formData, {
    headers: {
      "Content-Type": "multipart/form-data; ",
      jwt_token: token,
    },
  });
};
