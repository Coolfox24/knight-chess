import React from 'react';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';
import './App.css';

class Chessboard extends React.Component{

  knightCode = "";
  

  constructor(props)
  {
    super(props);
    this.state = {
      knightPosX: -1,
      knightPosY: -1,
      endPosX: -1,
      endPosY: -1,
      chessboard: Array(8).fill(0).map(row=> new Array(8).fill("\u00a0")), //Fill chessboard with nbsp
      routeDefined: false,
      route: [],
      knightSpots: new Help(),
    };
  }

  render()
  {
    //Setup the chessboard 
    var rows = [];
    for(var i = 0; i < 8; i++)
    {
      var row = [];
      for(var j = 0; j < 8; j++)
      {
        var boardclass = "w chess";
        if((i + j) % 2 == 1)
        {  
          boardclass = "b chess";
        }
        row.push(<ChessSquare classN={boardclass} boardId={i*8 + j} key={i*8 + j} squareState={this.state.chessboard[j][i]}  onClick={this.handleClick.bind(this, j, i)} />)
      }
      rows.push(<tr key={i}>{row}</tr>);
    }

    return(
      <div>
        <div id="Chess-Board">
          <table>
            <tbody>{rows}</tbody>
          </table>
        </div>
        <button onClick={this.startGame}>Start Game</button> 
        <button onClick={this.helpLogic}>Help</button> 
      </div>
    );
  }

  handleClick(x, y)
  { 
    //Check if game has been started yet
    if(this.state.knightPosX == -1)
    {
      console.log("Need to start a game first!");
      return;
    }

    //Check if move is valid
    if(!this.checkMove(x,y))
    {
      console.log("Invalid Move");
      return; //Exit function if invalid move
    }

    this.moveKnight(x, y);

    if(x == this.state.endPosX && y == this.state.endPosY)
    {
      console.log("You Win");
    }
    this.setState({routeDefined: false}); // To allow for rerouting if user clicks during help logic
  }
 
  startGame = () =>
  { 
    var newBoardState = this.state.chessboard.slice();

    if(this.state.knightPosX == -1)
    {
      //First run setup
      this.setState({knightPosX: 0, knightPosY: 0, endPosX: 0, endPosY: 0});
    }
    else
    {
      newBoardState[this.state.knightPosX][this.state.knightPosY] = "\u00a0";
      newBoardState[this.state.endPosX][this.state.endPosY] = "\u00a0";
    }

    //Randomize 2 numbers for start & end position
    var endPos, knightPos;
    do
    {
      endPos = Math.floor((Math.random() * 64));
      knightPos = Math.floor((Math.random() * 64));
    }
    while(endPos == knightPos)

    newBoardState[knightPos%8][Math.floor(knightPos/8)] = "\u2658";
    newBoardState[endPos%8][Math.floor(endPos/8)] = "\u25CE";

    this.setState({chessboard: newBoardState, knightPosX: knightPos % 8, knightPosY: Math.floor(knightPos/8), endPosX: endPos % 8, endPosY: Math.floor(endPos/8), routeDefined: false});    
  }

  moveKnight(x, y) {
    //Simple function to move knight from current pos to next position
    var newBoardState = this.state.chessboard.slice();

    newBoardState[this.state.knightPosX][this.state.knightPosY] = "\u00a0";
    newBoardState[x][y] = "\u2658";

    this.setState({ knightPosX: x, knightPosY: y, chessboard: newBoardState });
  }

  checkMove(tarX, tarY)
  {
    //Knights can move 2 in axis and 1 in the other axis for a valid move
    if((Math.abs(this.state.knightPosX - tarX) == 1 && Math.abs(this.state.knightPosY - tarY) == 2) || Math.abs(this.state.knightPosX - tarX) == 2 && Math.abs(this.state.knightPosY - tarY) == 1)
    {
      return true;
    }
    return false;
  }

  helpLogic = () =>
  {
    //Ensure game has been started before trying to solve
    if(this.state.knightPosX == -1)
    {
      console.log("Start a game before trying to get help");
      return;
    }

    if(this.state.routeDefined == false)
    {
      //Populate route with shortest path from knightpos to endpos
      //var knightSpots = new Help(); //Possibly have this as a state
      var route = this.state.knightSpots.calcPath(this.state.knightPosX, this.state.knightPosY, this.state.endPosX, this.state.endPosY)
      var next = route.pop();
      console.log(next);
      this.moveKnight(next[0], next[1]);
      this.setState({route: route});
      this.setState({routeDefined: true});
    }
    else
    {
      //Perform a move based on the last entry in route[]
      if(this.state.route.length == 0)
      {
        return;
      }
      var next = this.state.route.pop();
      this.moveKnight(next[0], next[1]);
    }
  }

}

//Simple component to update board state 
class ChessSquare extends React.Component
{
  render()
  {
    return(
      <td className={this.props.classN} id={this.props.boardId} onClick={this.props.onClick}>{this.props.squareState}</td>
    )
  }
}


class Help
{
  constructor()
  {
    this.adjacency = {};
    this.populateAdjacencies(); //Setup all valid knight moves at initialization of program
  }

  addSquare = (x, y) => 
  {
    //Add blank array to adjacency object for square @x, y
    this.adjacency[[x,y]] = [];
    return [x,y];
  }

  addEdge = (square1, square2) =>
  {
    //add coords for adjacent squares to adjacency object
    this.adjacency[square1].push(square2);
  }

  knightPositions = (x, y) =>
  {
    let square = this.addSquare(x,y);
    //check for potential moves that dont go outside of the board
    //Positive y Values
    if((x+2 < 8) && (y+1 < 8))
    {
      this.addEdge(square, [x+2, y+1]);
    }
    if((x-2 >= 0) && (y+1 < 8))
    {
      this.addEdge(square, [x-2, y+1]);
    }
    if((x+1 < 8) && (y+2 < 8))
    {
      this.addEdge(square, [x+1, y+2]);
    }
    if((x-1 >= 0) && (y+2 < 8))
    {
      this.addEdge(square, [x-1, y+2]);
    }
    //Negative y values
    if((x+2 < 8) && (y-1 >= 0))
    {
      this.addEdge(square, [x+2, y-1]);
    }
    if((x-2 >= 0) && (y-1 >= 0))
    {
      this.addEdge(square, [x-2, y-1]);
    }
    if((x+1 < 8) && (y-2 >= 0))
    {
      this.addEdge(square, [x+1, y-2]);
    }
    if((x-1 >= 0) && (y-2 >= 0))
    {
      this.addEdge(square, [x-1, y-2]);
    }
  }

  populateAdjacencies()
  {
    //Loop over chessboard populating each valid move a knight can perform
    for(var i = 0; i < 8; i++)
    {
      for(var j = 0; j < 8; j++)
      {
        this.knightPositions(i, j);
      }
    }
  }

  calcPath(startX, startY, endX, endY)
  {
    //Initialize length array 
    var nodeLens = {};
    for(var i = 0; i < 64; i ++)
    {
      nodeLens[i] = Infinity;
    }

    //Determine lengths to each square from current knight position
    nodeLens[startY * 8 + startX] = 0;
    var queue = [startY*8 + startX];
    var current;
    while(queue.length !=0)
    {
      current = queue.shift();
      var curConnected = this.adjacency[[current % 8, Math.floor(current/8)]];
      for(var j = 0; j < curConnected.length; j++)
      {
        var idx = curConnected[j][0] + curConnected[j][1] * 8;
        if(nodeLens[idx] == Infinity)
        {
          nodeLens[idx] = nodeLens[current] + 1;
          queue.push(curConnected[j][0] + curConnected[j][1] * 8 );
        }
      }
    }
    
    //Follow path back along from end point following decreasing distance to knight pos
    var path = [];
    var pathRemaining = nodeLens[endY * 8 + endX];
    path.push([endX, endY]);
    var current = this.adjacency[[endX, endY]];
    while(pathRemaining > 1) //Don't care about the 0 distance as thats where the knight already is
    {
      for(var i = 0; i < current.length; i++)
      {
        if(nodeLens[current[i][0] + current[i][1] * 8] == (pathRemaining-1))
        {
          path.push([current[i][0], current[i][1]]);
          current = this.adjacency[[current[i][0], current[i][1]]];
          pathRemaining--;
          break;
        }
      }
    }
    return path;
  }

}

export default Chessboard;
