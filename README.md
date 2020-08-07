# altV_objectPlacement

You can emit from a clientResource to this resource with:

alt.on('PlacingModule:setObject', (object) => {
    showAlphaObject(object);
});

So you can start placing an object in front of your player.

With the ARROW-Keys you can change the position and the rotation of the object you want to place.
(normal position depends on your player rotation)
With SHIFT-Key you can toggle the "alphaMode". So you can change the alpha-value of the object with the
ARROW-Up and ARROW-Down key.

Have FUN and fell free :)
