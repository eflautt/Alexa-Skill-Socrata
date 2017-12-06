/* eslint-disable  func-names */
/* eslint quote-props: ['error', 'consistent']*/

// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
// or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.

 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

let speechOutput;
let reprompt;
const welcomeOutput = 'Hello. I can tell you about your property taxes. What\'s your address?';
const welcomeReprompt = 'Let me know what your address is.';

 // 2. Skill Code =======================================================================================================

'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.5d5d7951-431f-4f5a-a2aa-82ac5dad9e1f';

const fetchPropertyTax = require('./fetch-property-tax');

const handlers = {
    'LaunchRequest': function () {
      this.response.speak(welcomeOutput).listen(welcomeReprompt);
      this.emit(':responseReady');
    },
    'LeafCollection': function () {
        //delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);

        const { address } = this.event.request.intent.slots;

        console.log('address:', address);

        if (address && address.value) {
          fetchPropertyTax(address.value)
          .then( data => {
            console.log('Got results, data:', data);

            speechOutput = `Your property tax total bill is <say-as interpret-as="unit">$${data.bill_total}</say-as>`;

            //say the results
            this.response.speak(speechOutput);
            this.emit(':responseReady');
          })
          .catch( err => {
            console.log('Error on fetch:', err);
            // TODO: Tell the user things went wrong.
            speechOutput = 'Dough! Something went wrong.';
            this.response.speak(speechOutput);
            this.emit(':responseReady');
          });
        }
    },
    // TODO: Fill in HelpIntent?
    'AMAZON.HelpIntent': function () {
        speechOutput = '';
        reprompt = '';
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = 'You canceled the request.';
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        speechOutput = 'Ok. I will stop now.';
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        var speechOutput = 'Thank you, come again!';
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // Not sure if we really need to connect to dynamo.
    alexa.dynamoDBTableName = 'AlexaState';
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

// Q: Why isn't this the default behavior?
// A: It might be that you can control the interaction in more detail.
// Also, in this case, it might be a way to validate that the NUMBER is five digits. Or maybe zip+4.
function delegateSlotCollection(){
  console.log('in delegateSlotCollection');
  console.log('current dialogState: '+this.event.request.dialogState);
    if (this.event.request.dialogState === 'STARTED') {
      console.log('in Beginning');
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED') {
      console.log('in not completed');
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(':delegate');
    } else {
      console.log('in completed');
      console.log('returning: '+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}
