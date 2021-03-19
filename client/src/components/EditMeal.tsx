import * as React from 'react'
import { Form, Button, Checkbox, TextArea } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchMeal, getMeals } from '../api/meals-api'
import { UpdateMealRequest } from '../types/UpdateMealRequest'
//import { Meals } from './Meals'
import { Meal } from '../types/Meal'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditMealProps {
  match: {
    params: {
      mealId: string
    }
  }
  auth: Auth
}

interface EditMealState {
  file: any
  uploadState: UploadState
  mealName: string
  done: boolean
  date: string
  recipe: string
}

export class EditMeal extends React.PureComponent<
  EditMealProps,
  EditMealState
> {
  state: EditMealState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    mealName: '',
    done: false,
    date: '',
    recipe: ''
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }
  
  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {    this.setState(
    {mealName: event.target.value})
  }
  
  handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {    this.setState(
    {date: event.target.value})
  }
  
  handleRecipeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {   this.setState(
    {recipe: event.target.value})
  }
   handleDoneChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {    this.setState(
    {done: !this.state.done})
  }
  
  
  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.mealId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }
  
  handleSave = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.mealName || !this.state.date) {
        alert('Name or Date cannot be empty')
        return
      }
      
      const updatedMeal: UpdateMealRequest = {
        name: this.state.mealName,
        dueDate: this.state.date,
        done: this.state.done,
        recipe: this.state.recipe
      }
      await patchMeal(this.props.auth.getIdToken(), this.props.match.params.mealId, updatedMeal )
      alert('Meal was updated!')
    } catch (e) {
      alert('Could not update the meal: ' + e.message)
    } 
  }


  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  setMealName(newMealName: string) {
    this.setState({
      mealName: newMealName
    })
  }
  setDate(newDate: string) {
    this.setState({
      date: newDate
    })
  }
  setDone(newStatus: boolean) {
    this.setState({
      done: newStatus
    })
  }
  
  async componentDidMount() {
    try {
      const meals:Meal[] = await getMeals(this.props.auth.getIdToken())
      const meal1: Meal = meals.filter(meal => meal.mealId == this.props.match.params.mealId)[0]
      
      this.setState({
        file: undefined,
        uploadState: UploadState.NoUpload,
        mealName: meal1.name,
        done: meal1.done,
        date: meal1.dueDate,
        recipe: meal1.recipe
      })
    } catch (e) {
      alert(`Failed to fetch meal: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <h1>Update meal</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Group inline> 
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>
            {this.renderButton()}
          </Form.Group>
        </Form>
        <Form onSubmit={this.handleSave}>
          <Form.Group inline> 
          <Form.Field>
            <label>Meal Name</label>
            <input placeholder='Hash browns' value={this.state.mealName} onChange={this.handleNameChange} />
          </Form.Field>
          <Form.Field>
            <label>Date</label>
            <input placeholder='yyyy-mm-dd format' value={this.state.date} onChange={this.handleDateChange} />
          </Form.Field>
          </Form.Group>
          <Form.Field
          control={TextArea}
          label='Short Recipe'
          placeholder='Take two potatoes..'
          value={this.state.recipe}
          onChange={this.handleRecipeChange}
          />
          <Form.Field
          control={Checkbox}
          label='I have done this'
          checked={this.state.done}
          onChange={this.handleDoneChange}
          />
          <Button type='submit'>Save</Button>
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
