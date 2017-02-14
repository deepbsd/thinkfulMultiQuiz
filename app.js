"use strict;"


;(function() {

	// ###########  Single-State Data Object ###############
	// #####################################################
	var state = {
		currentPage: 'start', // possible values: 'start','question', 'final'
		currentQuestion: 0,
		scores: {
			right: [],
			wrong: []
		},
		// this would be where state.questions[] would normally be
	}  // end of state object

	var tvTriviaQuiz = {
		url: "tvTrivia.txt"  // the file should be in the current directory
	}

	var firearmSafetyQuiz = {
		url: "firearmsQuestions.txt"   // file should be in the current directory
	}

	// this function gets called by renderIntro() in the 'startQuiz' event listener
	function getQuestionsData(choice, callback) {
		var settings = {
		    type: "GET",
		    url: choice.url,
		    async: true,
		    dataType: 'json'
	   	}
	   	$.ajax(settings)
	   	.done( function(data){
	   		state.questions = data;
	   		//console.log('object: '+data);
	   		console.log('state.questions: '+state.questions.length);
	   		callback
	   	})
	   	.fail( function() {
	   		console.log('Fail!');
	   	});
	};

	// This is the callback for getQuestionsData() invoked from renderIntro()
	function insertQuizData(questionData) {
		console.log('hitting insertQuizData...')
		try {
			state.questions = questionData;	
		}
		catch (e) {
			console.log('error: '+e);
		}
	};





	// #############  State Modification Functions #######################
	// ###################################################################


	function proceedQuiz() {

		if (state.currentPage === 'question' && state.currentQuestion < state.questions.length) {
			console.log('proceed reached, currentPage: ', state.currentPage);
			state.currentQuestion++;
			renderQuestion();
		} else {
			state.currentPage = 'final';
			console.log('proceed else, currentPage: ', state.currentPage);
			renderFinalPg();
		}
	}


	// ##############  Render Functions  ###################################
	// #####################################################################

	function scoreQuestion(questionNumber, selectedIndex) {    
		if (state.questions[questionNumber-1].options[selectedIndex].correct) {
			console.log("Correct!");
			state.scores.right.push(questionNumber);
		} else {
			state.scores.wrong.push(questionNumber);
			console.log("Nope! Sorry!");
		}
		//console.log('right: '+state.scores.right+'  wrong: '+state.scores.wrong);
	}


	function renderIntro() {
		var template = `<h1>Baby Boomer TV Quiz App</h1>
		<div class="safety-intro">
	    <p class="intro-text">Those of us who grew up during the 1950's and 60's experienced the early days of television. In a way, these were the "golden days" of television. No matter when you were born, chances are you've grown to love at least some of these characters. Test your recollection of these fun old shows!</p>
	    <form id="js-quizzapp-start-form">
	      <label for="quizapp-start">Start Your Boomer TV Trivia Quiz?</label>
	      <input type="hidden" name="start-quiz" id="start-quiz">
	      <button type="submit">Load and Start Quiz</button>
	    </form>
	    </div> <!-- end of safety-intro  -->
		`;
		//console.log(template);
		$(".quiz-container").html(template);



		$('#js-quizzapp-start-form').submit( function(ev) {
			ev.preventDefault();
			console.log('start pressed');
			state.currentPage = 'question';
			getQuestionsData(tvTriviaQuiz, proceedQuiz);



			//console.log('object: '+state.questions);			
			//proceedQuiz();
		});
	}

	function renderFinalPg() {
		var template = '';
		template = '<h2>Your Results:</h2>';
		template += '<h4 class="results">@correct out of @total-questions!</h4>';
		template += '<form id="js-quizzapp-restart"><label for="quizapp-start"></label>'; 
		template += '<input type="hidden" name="restart-quiz" id="restart-quiz">';
		template += '<button type="submit">Restart Quiz</button></form>';
		template = template.replace('@correct', state.scores.right.length)
					.replace('@total-questions', state.questions.length);

		console.log(state.scores.right.length+' questions answered correctly...')
		$(".quiz-container").html(template);

		$('#restart-quiz').click( function() {
			window.top.reload();
		})
	}  // end of renderFinalPg()

	function renderQuestion() {
		// Template definition
		var template = '';
		template += '<h2 class="question-header">@question-number</h2>';
		template += '<h3 class="question-text">@question</h2>';
		template += '<form class="answer-list-form" value="text">';
		template += '@answer-options';
		template += '</form>';
		template += '<div class="answer-feedback"><div class="proceed"><form id="proceed">';
	    template += '<input type="hidden" name="proceed"><button class="proceed_button" type="submit">Proceed</button></form></div>';
	    template += '<div class="right-wrong">@question-correct-or-not</div>';
	    template += '<div class="score">@total-right-answers of @total-questions are correct.</div>';
	    template += '</div>  <!-- End of answer feedback -->';


		// Response processing (template + data)
		var results = template
			.replace('@question-number', state.currentQuestion)
			.replace('@question', state.questions[state.currentQuestion-1].question)
			.replace('@answer-options', renderQuestionAnswerOptions(state.questions[state.currentQuestion-1].options))
			.replace('@question-correct-or-not', function() { 
				if (state.currentQuestion === 1) {
					return 'No score yet.';
				} else if (state.scores.right.indexOf(state.currentQuestion-1) > -1){
					console.log('currentQuestion: '+state.currentQuestion);
					return 'Correct!';
				 } else {
				 	console.log('currentQuestion: '+state.currentQuestion);
				 	return 'Nope! Sorry!';
				 }})
			.replace('@total-right-answers', state.scores.right.length)
			.replace('@total-questions', state.questions.length);
  		
  		// Update the page
		$('.quiz-container').html(results);


		// Handle Proceed button being pressed
		$('button.proceed_button').click( function(ev) {
			ev.preventDefault();
			var questionID = state.currentQuestion;
			var chosenAnswer = $('#answer-list option:selected').index();
			scoreQuestion(questionID, chosenAnswer);
			proceedQuiz();
		});
	}  // end of renderQuestion()

	// Seperate function just for rendering the options list
	function renderQuestionAnswerOptions (optionsList) {
		var answerText = '';
		var innerTemplate = '';

		for (var n=0; n<optionsList.length; n++){
			answerText = optionsList[n].text
			innerTemplate += '<option class="answer-list-item" value="text">'+answerText+'</option>';
		}

		return '<select id="answer-list">'+innerTemplate+'</select>';

	}



	// ##############  Event Listeners  #####################################
	// ######################################################################

	// Do this when we load the page

	renderIntro();
})()



