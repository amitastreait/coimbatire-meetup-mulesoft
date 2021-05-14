/**
 * @description       : 
 * @author            : Amit Singh
 * @group             : 
 * @last modified on  : 05-14-2021
 * @last modified by  : Amit Singh
 * Modifications Log 
 * Ver   Date         Author       Modification
 * 1.0   05-14-2021   Amit Singh   Initial Version
**/
import { LightningElement } from 'lwc';
import checkDiscount from '@salesforce/apex/DiscountComponentController.checkDiscount';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DiscountComponent extends LightningElement {

    channelName = '/event/DiscountEvent__e';

    subscription = {};
    _params = {}
    _errors;
    isSpiner = false;

    _result;

    connectedCallback() {     
        this.registerErrorListener();
        this.handleSubscribe();      
    }

    disconnectedCallback(){
        this.handleUnsubscribe();
    }

    handleChange = event=>{
        event.preventDefault();
        let name = event.target.name;
        let value = event.target.value;
        this._params[name] = value;
    }

    handleCheckDiscount = event=>{

        event.preventDefault();
        let allValid = this.validateInput();
        if(!allValid){
            return;
        }

        this.isSpiner = true;
        checkDiscount({ 
            params : JSON.stringify(this._params) 
        })
        .then(result => {
            //console.log('Result', result);
        })
        .catch(error => {
            console.error('Error: ', error);
            this._errors = error;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Not able to check discount. Please try againafter some time',
                variant: 'error'
            }));
        })
        .finally(()=>{
            this.isSpiner = true;
        })
    }

    handleSubscribe() {
        const messageCallback = this.handleResponse.bind(this);
        /*function(response) {
            this.isSpiner = true;
            console.log('New message received: ', JSON.stringify(response) );
        };*/

        subscribe(this.channelName, -1, messageCallback).then(response => {
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }

    handleResponse = response => {
        
        this.isSpiner = false;
        console.log('New message received: ', JSON.stringify(response.data.payload) );
        let responseData = response.data.payload;
        if(responseData.Discount__c){
            responseData.Discount__c = responseData.Discount__c.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        }
        this._result = responseData;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Response received',
            variant: 'success'
        }));
    }

    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    handleUnsubscribe() {
        this.toggleSubscribeButton(false);

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    validateInput = ()=>{
        const allValid = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
        }, true);
        return allValid;
    }

}
