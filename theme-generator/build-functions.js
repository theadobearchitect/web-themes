const path = require("path");
const glob = require("glob");
const devMode = process.env.NODE_ENV !== 'production'
const fs = require('fs');

module.exports = {
	listThemesScc : (dir, fileList = {}) => {  
		  var includeFileLines = new Array();	
		  fs.readdirSync(dir).forEach(file => {
			const filePath = path.join(dir, file)
			if (!fs.statSync(filePath).isDirectory()) { 
				includeFileLines.push(file);		
				//console.log('./' + file);
			}
		  })  
		  return includeFileLines;
		},
	prepThemes : (dir, fileList = {}) => {	
		//now we need to WRITE all these lines to a NEW FILE and LATER compile
		//check if tmp folder exists, if it does remove all files from under, or else just create it
		if (fs.existsSync("./tmp")) {
			fs.readdirSync("./tmp").forEach(file => {
				fs.unlinkSync("./tmp/" + file);
			});
		}
		else {
			fs.mkdirSync("./tmp");
		}
	  var variables = module.exports.listThemesScc('./themes-scss/variables');
	  var components = module.exports.listThemesScc('./themes-scss/components');
	  //console.log(variables); 
	  //console.log(components);
	  var themesDir = new Array();  
	  fs.readdirSync(dir).forEach(file => {
		const filePath = path.join(dir, file)
		if (fs.statSync(filePath).isDirectory()) { 		
			var includeFileLines = new Array();					        
			//now lets LOOP VARIABLES
			for (var i=0;i<variables.length;i++){
				const pathToCheck =  "./themes/" + file + "/variables/" + variables[i];
				const originalPath =  "./themes-scss/variables/" + variables[i];
				//console.log("pathToCheck:" + pathToCheck + ":" +  fs.existsSync(pathToCheck) + ":originalPath:" + originalPath + ":"+ fs.existsSync(originalPath));
				if (fs.existsSync(pathToCheck)) {
					includeFileLines.push("@import \""+pathToCheck + "\";");
				}
				else {
					includeFileLines.push("@import \""+originalPath + "\";");
				}			
			}
			//now components
			includeFileLines.push("@import \"~bootstrap/scss/bootstrap\";");
			includeFileLines.push("@import \"./themes-scss/mixins.scss\";");
			
			//now lets LOOP VARIABLES
			for (var i=0;i<components.length;i++){
				const pathToCheck =  "./themes/" + file + "/variables/" + components[i];
				const originalPath =  "./themes-scss/components/" + components[i];
				//console.log("pathToCheck:" + pathToCheck + ":" +  fs.existsSync(pathToCheck) + ":originalPath:" + originalPath + ":"+ fs.existsSync(originalPath));
				if (fs.existsSync(pathToCheck)) {
					includeFileLines.push("@import \""+pathToCheck + "\";");
				}
				else {
					includeFileLines.push("@import \""+originalPath + "\";");
				}			
			}		
			//now CREATE SCSS file for each of the theme
			fs.writeFileSync("./tmp/"+file + ".scss",includeFileLines.join("\n"));
		}
	  })
	  return fileList;
	},
	allFilesSync : (dir, fileList = {}) => {
	  fs.readdirSync(dir).forEach(file => {
		const filePath = path.join(dir, file)
		if (!fs.statSync(filePath).isDirectory() &&  file.match(/^theme.*?\.scss$/)) {
			var key = file.substring(0,file.indexOf(".scss"));
			
			fileList[key] = './' + filePath;
			//console.log('./' + filePath);
		}
	  })
	  return fileList;
	},
	finalizeThemes : (dir, fileList = {}) => {	
	  var themesDir = new Array();  
	  console.log("Finalize Themes Called with dir:" + dir);
	  fs.readdirSync(dir).forEach(file => {
		const filePath = path.join(dir, file)
		if (fs.statSync(filePath).isDirectory()) { 		
			var includeFileLines = new Array();					        		
			//We should now ensure we have a CLIENT LIB FOLDER for each of the themes-scss/components
			const pathToClientLib = "../ui.themes/src/main/content/jcr_root/apps/mcafee-consumer-wcm-themes/" + file;
			if (!fs.existsSync(pathToClientLib)) {
				fs.mkdirSync(pathToClientLib);
				fs.mkdirSync(pathToClientLib + "/css");
				//fs.mkdir(pathToClientLib + "/css");
			}
			if (fs.existsSync(pathToClientLib + "/css/"+ file + ".css")) {
				fs.unlinkSync(pathToClientLib + "/css/"+ file + ".css");
			}
			fs.copyFileSync("./dist/" + file + ".css",pathToClientLib + "/css/"+ file + ".css");
			//console.log("pathToClientLib:" + pathToClientLib);
			//TIME to generate .contentxml and CSS
			fs.writeFileSync(pathToClientLib +"/.content.xml",'<?xml version="1.0" encoding="UTF-8"?>\n'+
											'<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"\n'+
											'jcr:primaryType="cq:ClientLibraryFolder"\n'+
											'allowProxy="{Boolean}true"\n' +
											'categories="[' + file + ']"/>');

			fs.writeFileSync(pathToClientLib +"/css.txt",'#base=css\n'+ file +".css");

		}
	  })
	  return fileList;
	}
}
	
	
	
	
	
	









