import * as alt from 'alt';
import * as game from 'natives';

const player = alt.Player.local;

let showObject = false;
let alphaMode = false;
let newObjectToPlace = null;
let placeObjectDistance = 3;
let tmpObject = null;

alt.on('PlacingModule:setObject', (object) => {
    showAlphaObject(object);
});

function showAlphaObject(object) {
    requestModelPromise(game.getHashKey(object)).then((succ) => {
        if (succ) {
            newObjectToPlace = game.createObjectNoOffset(
                game.getHashKey(object),
                player.pos.x,
                player.pos.y,
                player.pos.z,
                1,
                0,
                1
            );
            game.setEntityAlpha(newObjectToPlace, 150, true);
            game.setEntityCollision(newObjectToPlace, false, true);
            showObject = true;
        }
    });
}

function requestModelPromise(model) {
    return new Promise((resolve, reject) => {
        if (!game.hasModelLoaded(model)) {
            game.requestModel(model);
        }
        // return resolve(false);
        let inter = alt.setInterval(() => {
            if (game.hasModelLoaded(model)) {
                alt.clearInterval(inter);
                return resolve(true);
            }
        }, 10);
    });
}

alt.everyTick(() => {
    let pos = player.pos;
    let fv = game.getEntityForwardVector(player.scriptID);

    var posFront = {
        x: pos.x + fv.x * placeObjectDistance,
        y: pos.y + fv.y * placeObjectDistance,
        z: pos.z,
    };
    if (showObject) {
        //go away
        if (game.isControlPressed(2, 27)) {
            if (alphaMode) {
                alt.log(`OLD ALPHA ${game.getEntityAlpha(newObjectToPlace)}`);
                alt.log(`NEW ALPHA ${game.getEntityAlpha(newObjectToPlace) + 1}`);
                game.setEntityAlpha(
                    newObjectToPlace,
                    game.getEntityAlpha(newObjectToPlace) + 1,
                    true
                );
            } else {
                if (placeObjectDistance < 10) {
                    placeObjectDistance += 0.1;
                }
            }
        }
        //come closer
        if (game.isControlPressed(2, 173)) {
            if (alphaMode) {
                game.setEntityAlpha(
                    newObjectToPlace,
                    game.getEntityAlpha(newObjectToPlace) - 1,
                    true
                );
            } else {
                if (placeObjectDistance > 0) {
                    placeObjectDistance -= 0.1;
                }
            }
        }
        //turn left
        if (game.isControlPressed(2, 174)) {
            let objectRot = game.getEntityRotation(newObjectToPlace);
            game.setEntityRotation(
                newObjectToPlace,
                objectRot.x,
                objectRot.y,
                objectRot.z + 3,
                2,
                false
            );
        }
        //turn right
        if (game.isControlPressed(2, 175)) {
            let objectRot = game.getEntityRotation(newObjectToPlace);
            game.setEntityRotation(
                newObjectToPlace,
                objectRot.x,
                objectRot.y,
                objectRot.z - 3,
                2,
                false
            );
        }

        if (newObjectToPlace !== null) {
            game.setEntityCoords(
                newObjectToPlace,
                posFront.x,
                posFront.y,
                player.pos.z,
                false,
                false,
                false,
                true
            );
            game.placeObjectOnGroundProperly(newObjectToPlace);
        }
    }
});

alt.on('keyup', (key) => {
    //SPACE to abort it
    if (key === 0x20) {
        alt.log('PlacingModule: Object deleted');
        game.deleteObject(newObjectToPlace);
        game.deleteObject(tmpObject);
        showObject = false;
        newObjectToPlace = null;
    }
    //E to place the item
    if (key === 0x45) {
        if (showObject) {
            alt.log('PlacingModule: Object placed');
            game.placeObjectOnGroundProperly(newObjectToPlace);
            game.freezeEntityPosition(newObjectToPlace, true);
            game.setModelAsNoLongerNeeded(newObjectToPlace);
            game.setEntityAlpha(newObjectToPlace, 255, true);
            game.setEntityCollision(newObjectToPlace, true, true);
            //Emit-Serverevent to do something serverside
            alt.emitServer('PlacingModule', newObjectToPlace);
            newObjectToPlace = null;
            showObject = false;
        }
    }
    //LEFTSHIFT to change alpha
    if (key === 0x10) {
        if (showObject) {
            alt.log(`PlacingModule: Changed alphaMode to ${alphaMode}`);
            alphaMode = !alphaMode;
        }
    }
});
