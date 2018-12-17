// Initialize Firebase
var config = {
    apiKey: "AIzaSyD2tT9IdSDcCX4W1gd5DFkhIWC5FpKsGPs",
    authDomain: "fodboldklub-1a181.firebaseapp.com",
    databaseURL: "https://fodboldklub-1a181.firebaseio.com",
    projectId: "fodboldklub-1a181",
    storageBucket: "fodboldklub-1a181.appspot.com",
    messagingSenderId: "945076628861"
};
firebase.initializeApp(config);




// Database reference
var dbRef = firebase.database();
var messagesRef = dbRef.ref('messages');

// Elementer
var txtEmail = document.getElementById('txtEmail');
var txtPassword = document.getElementById('txtPassword');
var btnLogin = document.getElementById('btnLogin');
var btnSignUp = document.getElementById('btnSignUp');
var btnLogout = document.getElementById('btnLogout');
var frontLogin = document.getElementById('frontLogin');
var container = document.getElementById('container');
var regModal = document.getElementById('regModal');



// Firebase login funktion
function loginFirebase() {
    // get email and pass
    var email = txtEmail.value;
    var pass = txtPassword.value;
    var auth = firebase.auth();


    if (email == "" || pass == "") {

        alert("Udfyld felterne");

    } else {
        // Sign in
        firebase.auth().signInWithEmailAndPassword(email, pass).catch(function (error) {
            console.log('Error', error);
        });
    }
}


// Registrerings Modal
function regModal() {
    document.getElementById("regModal").style.display = "block";
}

// Funktion til at lukke Modal
function closeRegModal() {
    document.getElementById("regModal").style.display = "none";
}



// Sign up Modal
$('#regModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-body input').val(recipient)
})


// Firebase SignUp funktion
function signUpFirebase() {
    // get email and pass
    var email = regEmail.value;
    var pass = regKode.value;
    var auth = firebase.auth();

    if (email == "" || pass == "") {

        alert("Udfyld felterne");

    } else {
        $('#regModal').modal('hide')
        firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function (error) {
            // Handle Errors here.
            console.log('Error', error);
        });

    };
};


// Firebase status, om man er logget ind eller ikke.
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log(user);
        frontLogin.classList.add('hide');
        container.classList.remove('hide');
        btnLogout.classList.remove('hide');

    } else {
        // No user is signed in.
        console.log('not logged in');
        btnLogout.classList.add('hide');
        container.classList.add('hide');
        frontLogin.classList.remove('hide');
    }
});


// Firebase log out.
function logOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
}


// Kigger efter om user er på listen. Er user på listen, vil join button blive diasbled og leave enable. Er user ikke på listen, vil join button blive enabled og leave button disabled.

function checkButtonsDisabled(key, list) {
    var join = document.getElementById('join' + key)
    var leave = document.getElementById('leave' + key)

    var joinDisabled = false;
    var leaveDisabled = true;

    for (var i = 0; i < list.length; i++) {
        joinDisabled = list[i] === firebase.auth().currentUser.uid;
        leaveDisabled = leaveDisabled && list[i] !== firebase.auth().currentUser.uid;
    }

    join.disabled = joinDisabled
    leave.disabled = leaveDisabled
}

// Loader de nye og nuværende message fra databasen.
messagesRef.on("child_added", function (snap) {
    console.log("added", snap.key, snap.val());

    var messages = firebase.database().ref('messages/' + snap.key + '/users')

    messages.once("value", function (snapshot) {
        var message = snap.val()

        var length = 0;

        if (snapshot.val() != null) {
            length = snapshot.val().length
        }


        var html = '';
        html += '<li class="list-group-item message">';
        html += '<div>';
        html += '<h1>' + message.titel + '</h1>';
        html += '<p>' + message.tidsp + '</p>';
        html += '<p>' + message.lokation + '</p>';
        html += '<h3>Antal tilmeldte <p id="antal' + snap.key + '">' + length + '</p></h3>'
        html += '<button class="join btn-primary" id="join' + snap.key + '">Tilmeld</button>'
        html += '<button class="leave btn-primary" id="leave' + snap.key + '">Afmeld</button>'
        html += '</div>';
        html += '</li>';
        $('#messages').append(html)

        if (snapshot.val() !== null) {
            checkButtonsDisabled(snap.key, snapshot.val())
        } else {
            var join = document.getElementById('join' + snap.key)
            var leave = document.getElementById('leave' + snap.key)

            join.disabled = false
            leave.disabled = true
        }

        document.getElementById('join' + snap.key).addEventListener("click", function () {
            tilMelding(snap.key)
        }, false);
        document.getElementById('leave' + snap.key).addEventListener('click', function () {
            afMelding(snap.key)
        })
    })


});




// Tilføjer user til databasen, og tjekker om user er der. Afhængig af user, vil CheckButtonDisabled blive kørt, og til sidst opdatere user. 
function tilMelding(key) {
    var signedUp = firebase.database().ref('messages/' + key + '/users')

    signedUp.once("value", function (snapshot) {
        console.log(snapshot.val())

        var value = snapshot.val();

        if (value == null) {
            value = [];
        }

        value.push(firebase.auth().currentUser.uid)
        checkButtonsDisabled(key, value)

        var html = document.getElementById("antal" + key).innerHTML = value.length
        var objectRef = firebase.database().ref('messages/' + key)

        objectRef.update({
            users: value
        })
    })


}



// Fjerner user, hvis user er i listen.
function afMelding(key) {
    var signedUp = firebase.database().ref('messages/' + key + '/users')

    signedUp.once("value", function (snapshot) {
        console.log(snapshot.val())

        var value = snapshot.val();



        var index = value.indexOf(firebase.auth().currentUser.uid)
        if (index > -1) {
            value.splice(index, 1);
        }

        checkButtonsDisabled(key, value)
        var html = document.getElementById("antal" + key).innerHTML = value.length
        var objectRef = firebase.database().ref('messages/' + key)

        objectRef.update({
            users: value
        })
    });

}


// Gemmer message
$('.opret').on("click", function (event) {
    event.preventDefault();
    if ($('#titel').val() != '' || $('#tidsp').val() != '') {
        messagesRef.push({
            titel: $('#titel').val().replace(/<[^>]*>/ig, ""),
            tidsp: $('#tidsp').val().replace(/<[^>]*>/ig, ""),
            lokation: $('#lokation').val().replace(/<[^>]*>/ig, ""),
        })
        messageForm.reset();
    } else {
        alert('Please fill atlease name or email!');
    }
});
