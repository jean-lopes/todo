{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}

module Lib
where

import Control.Applicative
import Database.SQLite.Simple
import qualified Data.Text as T
import Web.Scotty
import Network.Wai.Middleware.RequestLogger
import Control.Monad.IO.Class
import Data.Aeson hiding(json)
import GHC.Generics
import Prelude hiding (id)

data Todo = Todo { id   :: Maybe Int
                 , task :: T.Text
                 , done :: Bool
                 } deriving (Show,Generic)

instance FromRow Todo where
    fromRow = Todo <$> field <*> field <*> field

instance ToRow Todo where
    toRow (Todo a b c) = toRow (a, b, c)

instance ToJSON Todo where
    toEncoding = genericToEncoding defaultOptions

instance FromJSON Todo

setCssHeader :: ActionM ()
setCssHeader = setHeader "Content-Type" "text/css"

--run :: IO ()
main = do
    conn <- open "todo.db"
    execute_ conn "create table if not exists TODOS (id integer primary key not null, task text not null, done integer not null)"
    execute conn "delete from TODOS where id = ?" (Only (1::Int))    
    executeNamed conn "update TODOS set task = :task" [":task" := ("teste" ::T.Text)]    
    scotty 3000 $ do
        middleware logStdoutDev
        
        get "/"                    $ file "src/index.html"
        get "/w3.css"              $ setCssHeader >> file "src/w3.css"
        get "/w3-theme-teal.css"   $ setCssHeader >> file "src/w3-theme-teal.css"
        get "/style.css"           $ setCssHeader >> file "src/style.css"
        get "/jquery-2.2.4.min.js" $ file "src/jquery-2.2.4.min.js"
        get "/angular.min.js"      $ file "src/angular.min.js"
        get "/todo.js"             $ file "src/todo.js"

        --windows:
        --curl -H "Content-Type: application/json" -X POST -d "{\"todo\": {\"id\":null, \"task\": \"teste\", \"done\": 1}}" http://localhost:3000/todos
        --linux:
        --curl -H "Content-Type: application/json" -X POST -d '{"id":null, "task": "teste", "done": 1}' http://localhost:3000/todos
        post "/todos" $ do
            todo <- jsonData :: ActionM Todo            
            liftIO $ execute conn "insert into TODOS(id, task, done) values(?, ?, ?)" todo
            newId <- liftIO $ lastInsertRowId conn >>= return . fromIntegral
            json (newId :: Int)

        --curl -H "Content-Type: application/json" -X PUT -d "{\"id\":1, \"task\": \"teste\", \"done\": true}" http://localhost:3000/todos/1
        put "/todos/:id" $ do
            a <- param "id" :: ActionM Int
            todo <- jsonData :: ActionM Todo
            let b = task todo
                c = done todo
                ns = [":id" := a, ":task" := b, ":done" := c]
            liftIO $ executeNamed conn "update TODOS set task = :task, done = :done where id = :id" ns
            json todo

        get "/todos/:id" $ do
            id <- param "id"
            html $ id
        delete "/todo" $ do
            id <- param "id" :: ActionM Int
            liftIO $ execute conn "delete from TODOS where id = ?" (Only id)
            return ()
            

