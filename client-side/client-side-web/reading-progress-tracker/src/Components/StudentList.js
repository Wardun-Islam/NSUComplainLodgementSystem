import React, { useEffect } from "react";
import StudentTile from "./StudentTile";
import { getStudents } from "./ApiRequestHandler";
import TitlebarBelowImageList from "./StudentImageSlider";
export default function StudentList({assignment_id}) {
  
  const [studentList, setStudentList] = React.useState([]);

  useEffect(() => {
    getStudents({
      assignment_id: assignment_id,
      token: window.localStorage.getItem("token"),
    })
      .then(function (response) {
        console.log(response);
        setStudentList(response.data.students);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <div>
        {studentList && studentList.map((student)=>{
            return <div>
            <StudentTile name={student.first_name+" "+student.last_name} image={student.user_image} student_id={student.user_id}/>
            <TitlebarBelowImageList assignment_id={assignment_id} student_id={student.user_id} />
            </div>;
        })}
    </div>
  );
}