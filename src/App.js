import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { listStudents } from './graphql/queries'
import { createStudent } from './graphql/mutations'

class App extends Component {
  state = {
    student: {
      name: '',
      lastName: ''
    },
    studentList: []
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
  handleSubmit = e => {
    e.preventDefault()
    const { student, studentList } = this.state
    API.graphql(graphqlOperation(
      createStudent, 
      { input: student }
    ))
      .then(response => {
        const { createStudent: student } = response.data
        this.setState({
          studentList: [ student, ...studentList ],
          student: {
            name: '',
            lastName: ''
          }
        })
      })
  }
  async componentDidMount () {
    const students = await API.graphql(graphqlOperation(listStudents))
    const { items: studentList } = students.data.listStudents
    this.setState({ studentList })
  }
  render() {
    const { student, studentList } = this.state
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
          </form>
        </div>
        <div className='list-wrapper'>
          <h1>Student list</h1>
          <ul>
            {studentList.map((student, key) => (
              <li key={key}>{student.name} {student.lastName}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, true)
