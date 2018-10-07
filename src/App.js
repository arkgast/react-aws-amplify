import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { listStudents } from './graphql/queries'
import { createStudent, deleteStudent, updateStudent } from './graphql/mutations'
import { onCreateStudent, onUpdateStudent, onDeleteStudent } from './graphql/subscriptions'
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
  createStudent = () => {
    API.graphql(graphqlOperation(createStudent, {
      input: this.state.student 
    }))
  }
  updateStudent = () => {
    API.graphql(graphqlOperation(updateStudent, {
      input: this.state.student
    }))
  }
  deleteStudent = studentId => () => {
    API.graphql(graphqlOperation(deleteStudent, { input: { id: studentId } }))
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
  /**
   * Creates a listener for every kind of change that occurs in the information
   *
   */
  createListener = () => {
    this.createSubscription = API.graphql(graphqlOperation(onCreateStudent))
      .subscribe({
        next: (eventData) => {
          const { onCreateStudent: newStudent } = eventData.value.data
          this.setState({
            studentList: [ newStudent, ...this.state.studentList ],
            student: { name: '', lastName: '' }
          })
        }
      })

    this.updateSubscription = API.graphql(graphqlOperation(onUpdateStudent))
      .subscribe({
        next: (eventData) => {
          const { onUpdateStudent: newStudent } = eventData.value.data
          const studentList = cloneDeep(this.state.studentList)
          let oldStudent = studentList.filter(student => student.id === newStudent.id).pop()
          oldStudent.name = newStudent.name
          oldStudent.lastName = newStudent.lastName

          this.setState({
            studentList,
            student: { name: '', lastName: '' },
            update: false
          })
        }
      })

    this.deleteSubscription = API.graphql(graphqlOperation(onDeleteStudent))
      .subscribe({
        next: (eventData) => {
          const { id } = eventData.value.data.onDeleteStudent
          this.setState({
            studentList: this.state.studentList.filter(student => student.id !== id)
          })
        }
      })
  }
  removeListener = () => {
    this.createSubscription.unsubscribe()
    this.updateSubscription.unsubscribe()
    this.deleteSubscription.unsubscribe()
  }
  async componentDidMount () {
    const students = await API.graphql(graphqlOperation(listStudents))
    const { items: studentList } = students.data.listStudents
    this.setState({ studentList })

    this.createListener()
  }
  componentWillUnmount () {
    this.removeListener()
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
                <div>
                  {student.name} {student.lastName}
                </div>
                <div>
                  <button onClick={this.selectStudent(student.id)}>Edit</button>
                  <button onClick={this.deleteStudent(student.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, true)
