pragma solidity ^0.4.17;


contract Inbox {
    string public message;

    function Inbox(string initMessage) public {
        message = initMessage;
    }

    function setMessage(string _message) public {
        message = _message;
    }   
}