# Simple Snake Game

Built from Mary Rose Cook's template JavaScript game (https://github.com/maryrosecook/strange-loop/blob/master/worksheet.md).

## To run:
Clone the repository and then in Terminal:

    $ cd snake/
    $ python -m SimpleHTTPServer 8000
    $ open index.html

Then if you navigate to localhost:8000 you will be able to to play the game.  The rules are simple: You are the snake (black dot).  You want to eat the food (red dot).  Every time you do, you gain a new body part -- just don't run into yourself, and don't run into the walls (green lines) or you die.  The game will increase in speed as you keep eating food, for added difficulty!