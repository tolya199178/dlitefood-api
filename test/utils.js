var utils = {
      generateName: function(length){
          if (length < 14){
            return (new Date()).valueOf();            
          }
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for( var i=0; i < length - 14; i++ )
              if (i > 0 && i % 5 == 0){
                text += " ";
              }
              else {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
              }

          return text + ' ' + (new Date()).valueOf();
      },

      randomizeId : function(arr, quantity){
        var quantity = quantity || parseInt(arr.length*Math.random());
        var result = [];
        var counter = 0;

        while (counter < quantity){
          var order = parseInt(arr.length*Math.random());
          if (result.indexOf(arr[order].id) < 0){
            result.push(arr[order].id);
            counter++;
          }
        };

        if (quantity == 1){
          return result[0];
        } else {
          result = _.map(result, function(element, key){
            return {id: element}
          });
        };
        
        return result;
      }
    }

module.exports = utils;