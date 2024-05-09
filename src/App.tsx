import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import data from "./data.json"

interface Question
{
  QuestionId : number;
  Question : string;
  Hint : string;
  AnswerId : number;
  Choices : Choice[]
}
type QuestionAction = 
{ name : "Question", value : string } |
{ name : "Hint", value : string } |
{ name : "AnswerId", value : number } |
{ name : "ChoicesAdd", value : Choice } |
{ name : "ChoicesSub", value : Choice } |
{ name : "SetAnsewr", value : number } 
interface Choice
{
  ChoiceId : number;
  Word : string;
}
function App() {
  const [list, setList] = useState<Question[]>([])
  const questionFileRead = useCallback((string : string) => {
    const obj = JSON.parse(string)
    setList(obj as Question[])
  }, [])
  const removeQuestion = useCallback((question : Question) => {
    list && setList(list.filter((item) => question !== item))
  }, [list])
  const addQuestion = useCallback((question : Question) => {
    if (!list) return
    question.QuestionId = list.length
    setList([...list, question])
  }, [list])
  const removeChoice = useCallback((question : Question, choice : Choice) => {
    list && setList(list.map((q) => {
      if (q === question) {
        q.Choices = q.Choices.filter(c => c !== choice)
        return q
      }
      return q
    }))
  }, [list])
  const [jsonString, setJsonString] = useState<string>("")
  return (
    <div>
      <h1>문제 생성기</h1>
      <hr></hr>
      <input type='file' onChange={ async (e) => {
        
        if (!e.target.files) return
        const text = await e.target.files[0].text()
        questionFileRead(text)
      }}/>
      <span><input value={jsonString} onChange={e => { setJsonString(e.target.value)}}/><button onClick={() => {questionFileRead(jsonString)}}>JSON String</button></span>
      <hr/>
      <div style={{display:"flex", justifyContent: "space-between"}}>
        <div>
          {
            list && list.map((question, index) => <Item 
              key={index}
              question={question}
              remove={removeQuestion}
              removeChoice={removeChoice}
              index={index}
            />)
          }
        </div>
        <div>
          {useMemo(() => <QuestionForm add={addQuestion}/>,[list])}
          <hr/>
          <button onClick={() => {
            console.log(JSON.stringify(list))
          }}>출력</button>
          <button onClick={() => {
            const element = document.createElement("a")
            const file = new Blob([JSON.stringify(list)], {type : "application/json"})
            element.href = URL.createObjectURL(file)
            element.download = "data.json"
            document.body.appendChild(element)
            element.click()
          }}>
            다운로드
          </button>
        </div>
        
      </div>
    </div>
  );
  function QuestionForm({add} : {add : (question : Question) => void}) {
    const [question, dispatch] = useReducer(questionReducer, {
      QuestionId : -1,
      Question : "문제",
      Hint : "",
      AnswerId : 0,
      Choices : []
    })
    function questionReducer(state:Question, action : QuestionAction) {
      const prev = {...state}
      switch (action.name) {
        case "Question" :
          prev.Question = action.value
          break;
        case 'Hint':
          prev.Hint = action.value
          break;
        case 'AnswerId':
          prev.AnswerId = action.value
          break;
        case 'ChoicesAdd':
          prev.Choices = [...prev.Choices, action.value]
          break;
        case 'ChoicesSub':
          prev.Choices = prev.Choices.filter((c) => c !== action.value)
          break;
        case 'SetAnsewr':
          prev.AnswerId = action.value
          break;
      }
      return prev
    }
    const [choiceInput, setChoiceInput] = useState<string>()
    const addChoice = useCallback(() => {
      dispatch({
        name : "ChoicesAdd",
        value : {
          ChoiceId : question.Choices.length === 0 ? 0 : question.Choices[question.Choices.length - 1].ChoiceId + 1,
          Word : choiceInput!
        }
      })
      // setQuestionInput("")
      setChoiceInput("")
    }, [question, choiceInput])
    useEffect(()=>{
      // console.log(question)
    },[question])
    return (
      <div>
        <div>
          <label>문제<input value={question.Question || ""} onChange={(e) => {dispatch({name : "Question", value : e.target.value})}}/></label>
          <label>Hint<input value={question.Hint || ""} onChange={(e) => {dispatch({name : "Hint", value : e.target.value})}}/></label>
          <ul>
            {question.Choices.map((choice) => (
              <li key={choice.ChoiceId}>
                <b 
                  style={question.AnswerId === choice.ChoiceId ? {color : "blue"} : {}}
                  onClick={()=>{dispatch({name:"SetAnsewr", value:choice.ChoiceId})}}
                >
                  {choice.Word}
                </b>
                <b
                  style={{color : "red" }}
                  onClick={() => {
                    dispatch({name:"ChoicesSub" , value : choice})
                  }}
                >
                  빼기
                </b>
              </li>))}
          </ul>
        </div>
        <div>
          <input value={choiceInput || ""} onChange={(e) => {setChoiceInput(e.target.value)}}/><button onClick={addChoice}>객관식 추가</button>
        </div>
        <button onClick={() => {add(question)}}>등록</button>
      </div>
    )
  }
  function Item({question, remove, index} : {
    question : Question;
    remove : (question : Question) => void;
    removeChoice : (question : Question, choice : Choice) => void;
    index : number
  }) {
    return (
      <div>
        <div>
          <h2>{index}번 {question.Question} <span style={{color : "red"}} onClick={()=>{remove(question)}}>빼기</span></h2>
          <h3>HINT : {question.Hint}</h3>
          <ul>
            { question.Choices.map((choice, index) => {
              return (
                <li key={index}>
                  <span style={question.AnswerId === choice.ChoiceId ? {color : "blue"} : {}}>{choice.Word}</span>
                  <span
                    style={{color : "red"}}
                    onClick={(e)=>{
                    removeChoice(question, choice)
                  }}>빼기</span>
                </li>
              )
            }) }
          </ul>
        </div>
      </div>
    )
  }
}

export default App;
