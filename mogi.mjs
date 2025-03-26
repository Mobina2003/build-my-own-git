import path from 'path';
import fs from 'fs/promises';
class mogi
{
    constructor(repoPath='.')
    {
        this.repoPath = path.join(repoPath,'.mogi');
        this.objectspath = path.join(this.repoPath,'objects'); //.mogi/objects
        this.headPath = path.join(this.repoPath, 'HEAD'); //.mogi/HEAD
        //staging
        this.indexpath = path.join(this.repoPath , 'index'); //.mogi/index
        this.init();
    }
//initialize the mogi folder
    async init()
    {
        await fs.mkdir(this.objectspath, {recursive: true});
        try
        {    
            await fs.writeFile(this.headPath, '' , {flag: 'wx'}); //wx: write if not exist
            await fs.writeFile(this.indexpath, '', JSON.stringify({}), {flag: 'wx'});
        }catch(error)
        {
            console.log('already initialized .mogi folder');
        }
        
        
    }
}