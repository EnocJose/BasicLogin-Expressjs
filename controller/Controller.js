const data = require("../model/model")
const bcrypt = require("bcryptjs")


/*DATA contiene dos arrays que seran nuestra base de datos artificial donde se iran almacenando los usuarios creados
 y sus respectivas passwords*/

function getPositionUser(user,req){ // obtener posicion del usuario "si existe" en nuestro array users, Usando los datos de usuario introducidos o los almacenados en la session
	var id
	data.users.forEach(function(value,i){
		if(value==user.username || value==req.session.username){
			id=i;
		}
	})

	return id 
}

function getPositionUserOnlyInputData(user){ // obtener posicion del usuario "si existe" en nuestro array users solo con los datos de usuario introducidos
	var id
	data.users.forEach(function(value,i){

		if(value==user.username ){
			id=i;
		}
	})

	return id
}

async function getHashedPassword(password){
	var salt = await bcrypt.genSalt(10)
	return bcrypt.hash(password,salt)
}

async function createUser(user){
	var messaje

	if(getPositionUserOnlyInputData(user)==undefined)//vemos si el usuario existe en nuestro array users si no, Entonces lo registramos
	{
		//tanto la posicion del password como la del usuario seran las mismas en los dos arrays
		data.users.push(user.username)
		await getHashedPassword(user.password).then((h)=>data.hashedPasswords.push(h))// almacenamos la contraseña hasheada 
		messaje="user created"
	}
	else{
		messaje="User already exists"
	}

	return messaje		
}

function createSession(req,user){
	req.session.username = user.username
	req.session.password = user.password
	return "  ...session created..."
}

async function login(user,req){
	var messaje
	var id = getPositionUser(user,req)// si el usuario existe , regresa la posicion del usuario que esta en nuestra base de datos artificial

	if(id!=undefined){

		var getIn

		//con el id compara la contraseña del usuario que esta en la base de datos con la contrasela introducida en el momento
		// o si existe una session, Se compara la contraseña del usuario que esta en la base de datos con la de la session.

		if(user.username!=undefined){
			getIn = await bcrypt.compare(user.password, data.hashedPasswords[id])
		}  
		else{
			getIn = await bcrypt.compare(req.session.password, data.hashedPasswords[id])
		}

		switch(getIn){// si la contraseña es correcta

			case true: 
				messaje="you have successfully logged in"

				if (req.session.username==undefined || req.session.password==undefined)
					messaje+=createSession(req,user)
				break;

			case false:
				messaje="invalid data"// si la contraseña es invalida
				break;
		}
		
	}
	else{
		messaje="invalid data" // si el usuario no existe
	}

	return messaje
}

async function changePassword(user){

	var id = getPositionUserOnlyInputData(user)
	var messaje

	if(id!=undefined)// si el usuario existe entra
	{
		var isMatch=await bcrypt.compare(user.password, data.hashedPasswords[id])
	    if (isMatch) {// si la contraseña para ese usuario es correcta 
	        await getHashedPassword(user.newPassword).then(h => data.hashedPasswords[id]=h)
			messaje="password modified"
	    }
	    else{
	        messaje="the username or password is incorrect"	
	    }
	}
	else
	{
		messaje="the username or password is incorrect"
	}

	return messaje

}

module.exports ={createUser,login,changePassword};