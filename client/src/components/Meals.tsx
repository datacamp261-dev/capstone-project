import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createMeal, deleteMeal, getMeals, patchMeal } from '../api/meals-api'
import Auth from '../auth/Auth'
import { Meal } from '../types/Meal'

interface MealsProps {
  auth: Auth
  history: History
}

interface MealsState {
  meals: Meal[]
  newMealName: string
  loadingMeals: boolean
}

export class Meals extends React.PureComponent<MealsProps, MealsState> {
  state: MealsState = {
    meals: [],
    newMealName: '',
    loadingMeals: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMealName: event.target.value })
  }

  onEditButtonClick = (mealId: string) => {
    this.props.history.push(`/meals/${mealId}/edit`)
  }

  onMealCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newMeal = await createMeal(this.props.auth.getIdToken(), {
        name: this.state.newMealName,
        dueDate
      })
      this.setState({
        meals: [...this.state.meals, newMeal],
        newMealName: ''
      })
    } catch {
      alert('Meal creation failed')
    }
  }

  onMealDelete = async (mealId: string) => {
    try {
      await deleteMeal(this.props.auth.getIdToken(), mealId)
      this.setState({
        meals: this.state.meals.filter(meal => meal.mealId != mealId)
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  onMealCheck = async (pos: number) => {
    try {
      const meal = this.state.meals[pos]
      await patchMeal(this.props.auth.getIdToken(), meal.mealId, {
        name: meal.name,
        dueDate: meal.dueDate,
        done: !meal.done,
        recipe: meal.recipe
      })
      this.setState({
        meals: update(this.state.meals, {
          [pos]: { done: { $set: !meal.done } }
        })
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const meals = await getMeals(this.props.auth.getIdToken())
      this.setState({
        meals,
        loadingMeals: false
      })
    } catch (e) {
      alert(`Failed to fetch meals: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">MEAL PLANNER</Header>

        {this.renderCreateMealInput()}

        {this.renderMeals()}
      </div>
    )
  }

  renderCreateMealInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Meal',
              onClick: this.onMealCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Something to satisfy your soul..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderMeals() {
    if (this.state.loadingMeals) {
      return this.renderLoading()
    }

    return this.renderMealsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Meals
        </Loader>
      </Grid.Row>
    )
  }

  renderMealsList() {
    return (
      <Grid padded>
        {this.state.meals.map((meal, pos) => {
          return (
            <Grid.Row key={meal.mealId}>
              <Grid.Column width={1} verticalAlign="top">
                <Checkbox
                  onChange={() => this.onMealCheck(pos)}
                  checked={meal.done}
                />
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="top">
                {meal.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="top">
              {meal.attachmentUrl && (
                <Image src={meal.attachmentUrl} size="small" wrapped />
              )}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {meal.recipe}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {meal.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(meal.mealId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onMealDelete(meal.mealId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
