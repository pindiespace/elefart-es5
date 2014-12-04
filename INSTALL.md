wevidhere INSTALL
=================

=======================================
Part I: Setting Up Your Local Computer
=======================================

1.	Create an account on GitHub, if you haven’t already
	- http://www.github.com

2.	Download and install git, NodeJS, and Sublime Text
	- http://git-scm.com/download
	- http://nodejs.org/download/

	Note that Node will install into your System area, e.g.
		Windows: 
			C:\Program Files (x86)\nodejs\
			to make npm work, you need to create the following directory on C: drive

				mkdir C:\Users\xxxx\AppData\Roaming\npm

			where 'xxx' is the user name you are currently logged in with under Windows

		Mac:
			Usr/local/bin/node

		Windows: 
			make sure you select "use git from Windows command prompt" 
			(the bottom of the three shell options, in red)
		Mac: 
			no special instructions

3.	Load the git command line console window

4.	Create a default directory for your new project. 
	- Create a sub-folder in your project directory
	- Put your current folder holding all your HTML, JS, CSS and other files into this folder. 
	- Name it "public"

5.	Note the following files will be invisible on a Mac or Linux system, unless you 
	make them visible

		.gitignore (remove stuff we don't want to upload)
		.bowerrc (allows bower to place files grabbed by bower in a sub-directory)

8.	Load the NodeJS command-line console window 


9. Setting up Your Git Repository
	- use the NodeJS command line (git should be available, test by typing 'git')
	- Basic git manipulation
		@link http://rogerdudler.github.io/git-guide/ 

		a. cd back into the directory you created for your project. 
		b. You should be inside a project folder, but OUTSIDE the ‘public’ folder with your website. 
		c. Test by typing ‘dir’ (Windows) or ‘ls’ (Mac) to confirm you see files including package.json.
		d. Create a new project on github.com, with the name ‘wevidhere-yourlastname’
		e. Return to your git command prompt, and cd into your project directory (one level above ‘public’ folder)
		f. Clone the git project via 
			
			git clone /path/to/repository
			
			(when using a remote server, your command will be)

			git clone https://github.com/username/path/to/repository
			
			(alternate)
			git remote add origin https://github.com/username/path/to/repository

		g. Add all your files

			git add *

		h. Push the changes to your git server

			git commit -m "My Commit message here"
			git push origin master
			
		   in some cases, you may have to use the following:
		   	git push origin HEAD:master

10. Setup Your Localhost
	a. In your terminal, cd to your default directory
	b. Run the npm installer (uses package.json)
		
		npm install

	c. Use "sudo" (super-user) commands to check tools directly (don’t use the ‘sudo’ on Windows)

		sudo npm install –g git
		sudo npm install -g bower

11.	Try starting your local server
	a. cd outside of public, but in your project directory
	b. run the following command (from scripts in package.json and bower.json)

		npm start

12. Test http://localhost:8000 to see if it is running. 
	- By default, the ‘http-server’ you installed should look inside a /public directory in your project for your site files