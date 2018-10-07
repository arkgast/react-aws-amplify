import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { listStudents } from './graphql/queries'
import { createStudent, deleteStudent, updateStudent } from './graphql/mutations'
import { cloneDeep } from 'lodash'

class App extends Component {
  state = {
    student: {
      name: '',
      lastName: ''
    },
    studentList: [],
    update: false
  }
  handleChange = e => {
    const { name, value } = e.target
    const { student } = this.state
    this.setState({
      student: {
        ...student,
        [name]: value
      }
    })
  }
  handleSubmit = async e => {
    e.preventDefault()
    if (this.state.update) {
      this.updateStudent()
    } else {
      this.createStudent()
    }
  }
  createStudent = async () => {
    const { student, studentList } = this.state
    const response = await API.graphql(graphqlOperation(
      createStudent, 
      { input: student }
    ))
    const { createStudent: newStudent } = response.data
    this.setState({
      studentList: [ newStudent, ...studentList ],
      student: {
        name: '',
        lastName: ''
      }
    })
  }
  updateStudent = async () => {
    const { student, studentList } = this.state
    const response = await API.graphql(graphqlOperation(
      updateStudent,
      { input: student }
    ))

    const { updateStudent: newStudent } = response.data
    const newList = cloneDeep(studentList)
    let oldStudent = newList.filter(student => student.id === newStudent.id).pop()
    oldStudent.name = newStudent.name
    oldStudent.lastName = newStudent.lastName

    this.setState({
      studentList: newList,
      student: { name: '', lastName: '' },
      update: false
    })
  }
  deleteStudent = studentId => async () => {
    const result = await API.graphql(graphqlOperation(deleteStudent, { input: { id: studentId } }))
    const { id } = result.data.deleteStudent
    this.setState({
      studentList: this.state.studentList.filter(student => student.id !== id)
    })
  }
  selectStudent = studentId => () => {
    const selectedStudent = this.state.studentList.filter(student => student.id === studentId)
    this.setState({
      student: selectedStudent.pop(),
      update: true
    })
  }
  deselectStudent = () => {
    this.setState({
      student: {
        name: '',
        lastName: ''
      },
      update: false
    })
  }
  async componentDidMount () {
    const students = await API.graphql(graphqlOperation(listStudents))
    const { items: studentList } = students.data.listStudents
    this.setState({ studentList })
  }
  render() {
    const { student, studentList, update } = this.state
    return (
      <div className='container'>
        <div className='form-wrapper'>
          <h1>Student info</h1>
          <form onSubmit={this.handleSubmit}>
            <input
              type='text'
              name='name'
              placeholder='Name'
              value={student.name}
              onChange={this.handleChange}
            />
            <input
              type='text'
              name='lastName'
              placeholder='Last Name'
              value={student.lastName}
              onChange={this.handleChange}
            />
            <button>Save</button>
            {update && (
              <button onClick={this.deselectStudent}>Cancel edit</button>
            )}
          </form>
        </div>
        <div className='list-wrapper'>
          <h1>Student list</h1>
          <ul>
            {studentList.map((student, key) => (
              <li key={key}>
                {student.name} {student.lastName}
                <button onClick={this.selectStudent(student.id)}>Edit</button>
                <button onClick={this.deleteStudent(student.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, true)
