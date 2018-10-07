// eslint-disable
// this is an auto generated file. This will be overwritten

export const getStudent = `query GetStudent($id: ID!) {
  getStudent(id: $id) {
    id
    name
    lastName
  }
}
`;
export const listStudents = `query ListStudents(
  $filter: ModelStudentFilterInput
  $limit: Int
  $nextToken: String
) {
  listStudents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      lastName
    }
    nextToken
  }
}
`;
