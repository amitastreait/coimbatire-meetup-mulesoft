public without sharing class DiscountComponentController {
    
    @AuraEnabled
    public static void checkDiscount(String params){
        try {
            Map<String,Object> paramsMap = (Map<String,Object>)System.JSON.deserializeUntyped(params);
            PricingEvent__e event =  new PricingEvent__e();
            event.CustomerId__c = (String)paramsMap.get('customerId');
            event.Location__c   = (String)paramsMap.get('countryCode');
            Eventbus.publish(event);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
